import db from "../config/db.js";
import path from "path";
import {
  sendPushNotificationToAdmins,
  sendPushNotificationToUser,
} from "../utils/pushNotifications.js";

async function notifyAdmins(type, message, meta = {}) {
  try {
    const [adminRows] = await db.query(
      "SELECT id FROM users WHERE role = 'admin'"
    );

    if (!adminRows.length) return;

    for (const admin of adminRows) {
      const [notifResult] = await db.query(
        "INSERT INTO notifications (user_id, type, message, is_read, created_at) VALUES (?, ?, ?, 0, NOW())",
        [admin.id, type, message]
      );

      const payload = {
        id: notifResult.insertId,
        user_id: admin.id,
        type,
        message,
        is_read: 0,
        created_at: new Date().toISOString(),
        meta,
      };

    }

    await sendPushNotificationToAdmins("New activity", message, meta);
  } catch (err) {
    console.error(" notifyAdmins error:", err);
  }
}

export const createProjectPost = async (req, res) => {
  try {
    const { title, description, github_link } = req.body;
    const user_id = req.user.id;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.query(
      "INSERT INTO projects_posts (user_id, title, description, github_link, image_url) VALUES (?, ?, ?, ?, ?)",
      [user_id, title, description, github_link, image_url]
    );

    const projectId = result.insertId;

    const [userRows] = await db.query(
      "SELECT name FROM users WHERE id = ? LIMIT 1",
      [user_id]
    );
    const creatorName = userRows[0]?.name || "Student";

    const msg = `${creatorName} created a new project: "${title}"`;
    await notifyAdmins("project_created", msg, {
      projectId,
      fromUserId: user_id,
    });

    res
      .status(201)
      .json({ message: "Project created successfully ", projectId });
  } catch (err) {
    console.error(" Error creating project:", err);
    res.status(500).json({ error: "Error creating project" });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const [projects] = await db.query(`
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM project_likes WHERE post_id = p.id) AS likes_count,
        (SELECT COUNT(*) FROM project_comments WHERE post_id = p.id) AS comments_count
      FROM  projects_posts p
      ORDER BY p.created_at DESC
    `);

    res.status(200).json(projects);
  } catch (error) {
    console.error(" Error fetching projects:", error);
    res.status(500).json({ error: "Error fetching projects" });
  }
};



export const getSingleProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    const [rows] = await db.query(
      `
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM project_likes WHERE post_id = p.id) AS likes_count,
        (SELECT COUNT(*) FROM project_comments WHERE post_id = p.id) AS comments_count
      FROM projects_posts p
      WHERE p.id = ?
      `,
      [projectId]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Project not found" });

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(" Error fetching project:", error);
    res.status(500).json({ error: "Error fetching project" });
  }
};



export const toggleLikeProject = async (req, res) => {
  try {
    const user_id = req.user.id;
    const userRole = req.user.role;
    const { id } = req.params; // project id

    const [exists] = await db.query(
      "SELECT * FROM project_likes WHERE post_id = ? AND user_id = ?",
      [id, user_id]
    );

    if (exists.length) {
      await db.query(
        "DELETE FROM project_likes WHERE post_id = ? AND user_id = ?",
        [id, user_id]
      );
      return res.json({ liked: false });
    } else {
      await db.query(
        "INSERT INTO project_likes (post_id, user_id) VALUES (?, ?)",
        [id, user_id]
      );

      const [userRows] = await db.query(
        "SELECT name FROM users WHERE id = ? LIMIT 1",
        [user_id]
      );
      const likerName = userRows[0]?.name || "Student";

      const msg = `${likerName} liked project #${id}`;
      await notifyAdmins("project_like", msg, {
        projectId: Number(id),
        fromUserId: user_id,
      });

   
      try {
        if (userRole === "admin") {
          const [[project]] = await db.query(
            "SELECT user_id, title FROM projects_posts WHERE id = ?",
            [id]
          );

          if (project && project.user_id && project.user_id !== user_id) {
            const ownerId = project.user_id;
            const projectTitle = project.title || `Project #${id}`;
            const studentMsg = `Admin ${likerName} liked your project: "${projectTitle}"`;

   
            await db.execute(
              "INSERT INTO notifications (user_id, type, message, is_read, created_at) VALUES (?,?,?,?, NOW())",
              [ownerId, "project_like_admin", studentMsg, 0]
            );

           
            await sendPushNotificationToUser(
              ownerId,
              "Your project got a like!",
              studentMsg,
              {
                type: "project_like_admin",
                projectId: String(id),
                fromUserId: String(user_id),
              }
            );
          }
        }
      } catch (e) {
        console.warn(
          "toggleLikeProject: student notification failed:",
          e.code || e.message
        );
      }

      return res.json({ liked: true });
    }
  } catch (err) {
    console.error(" Error toggling like:", err);
    res.status(500).json({ error: "Error toggling like" });
  }
};

export const addComment = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;
    const { comment, reply_to } = req.body;

    if (!comment?.trim()) {
      return res.status(400).json({ error: "Empty comment" });
    }

    const [insertResult] = await db.query(
      "INSERT INTO project_comments (post_id, user_id, comment, reply_to) VALUES (?, ?, ?, ?)",
      [id, user_id, comment, reply_to || null]
    );

    const commentId = insertResult.insertId;

    const [userRows] = await db.query(
      "SELECT name FROM users WHERE id = ? LIMIT 1",
      [user_id]
    );
    const commenterName = userRows[0]?.name || "Student";

    const type = reply_to ? "project_comment_reply" : "project_comment";
    const msg = reply_to
      ? `${commenterName} replied on a comment in project #${id}`
      : `${commenterName} commented on project #${id}`;

    await notifyAdmins(type, msg, {
      projectId: Number(id),
      commentId,
      fromUserId: user_id,
    });

    res.status(201).json({
      message: reply_to ? "Reply added " : "Comment added ",
      commentId,
    });
  } catch (err) {
    console.error(" Error adding comment:", err);
    res.status(500).json({ error: "Error adding comment" });
  }
};


export const getComments = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        c.id,
        c.post_id,
        c.user_id,
        c.comment,
        c.reply_to,
        c.created_at,
        u.name AS user_name,
        r.user_id AS reply_to_user
      FROM project_comments c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN project_comments r ON c.reply_to = r.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
      `,
      [id]
    );

    const commentsMap = {};
    const topLevel = [];

    rows.forEach((c) => (commentsMap[c.id] = { ...c, replies: [] }));

    rows.forEach((c) => {
      if (c.reply_to) {
        commentsMap[c.reply_to]?.replies.push(commentsMap[c.id]);
      } else {
        topLevel.push(commentsMap[c.id]);
      }
    });

    res.json(topLevel);
  } catch (err) {
    console.error(" Error fetching comments:", err);
    res.status(500).json({ error: "Error fetching comments" });
  }
};


export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const [projectRows] = await db.query(
      "SELECT * FROM projects_posts WHERE id = ?",
      [projectId]
    );
    if (!projectRows.length) {
      return res.status(404).json({ error: "Project not found" });
    }

    const project = projectRows[0];

    if (project.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized — not your project" });
    }

    const { title, description, github_link } = req.body;
    let imagePath = project.image_url;

    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const updatedTitle =
      title && title.trim() !== "" ? title : project.title;
    const updatedDescription =
      description && description.trim() !== ""
        ? description
        : project.description;
    const updatedGithub =
      github_link && github_link.trim() !== ""
        ? github_link
        : project.github_link;

    await db.query(
      `UPDATE projects_posts 
       SET title = ?, description = ?, github_link = ?, image_url = ?, updated_at = NOW()
       WHERE id = ?`,
      [updatedTitle, updatedDescription, updatedGithub, imagePath, projectId]
    );

    res.status(200).json({ message: " Project updated successfully" });
  } catch (err) {
    console.error(" Error updating project:", err);
    res
      .status(500)
      .json({ error: "Error updating project", details: err.message });
  }
};




export const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const [project] = await db.query(
      "SELECT * FROM projects_posts WHERE id = ?",
      [projectId]
    );
    if (!project.length) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project[0].user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized — not your project" });
    }

    await db.query("DELETE FROM projects_posts WHERE id = ?", [projectId]);
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error(" Error deleting project:", err);
    res.status(500).json({ error: "Error deleting project" });
  }
};
