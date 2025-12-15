// backend/src/utils/notifyAdminsEvaluation.js
import db from "../config/db.js";
import { getIO } from "../socket.js";

export async function notifyAdminsEvaluation({
  direction,
  evaluatorId,
  evaluateeId,
}) {
  //  get evaluator/evaluatee names
  const [[evaluator]] = await db.query(
    `
    SELECT u.id, COALESCE(p.full_name, u.name) AS full_name, u.role
    FROM users u
    LEFT JOIN profile p ON p.user_id = u.id
    WHERE u.id = ?
    `,
    [evaluatorId]
  );

  const [[evaluatee]] = await db.query(
    `
    SELECT u.id, COALESCE(p.full_name, u.name) AS full_name, u.role
    FROM users u
    LEFT JOIN profile p ON p.user_id = u.id
    WHERE u.id = ?
    `,
    [evaluateeId]
  );

  const evaluatorName = evaluator?.full_name || `User#${evaluatorId}`;
  const evaluateeName = evaluatee?.full_name || `User#${evaluateeId}`;

  //  build message
  const message =
    direction === "student_to_supervisor"
      ? `Student "${evaluatorName}" evaluated Supervisor "${evaluateeName}".`
      : `Supervisor "${evaluatorName}" evaluated Student "${evaluateeName}".`;

  const data = {
    direction,
    evaluatorId,
    evaluateeId,
  };

  //  get admins
  const [admins] = await db.query(
    `SELECT id FROM users WHERE role = 'admin'`
  );

  if (!admins.length) return;

  const io = getIO();

  // insert notification per admin + emit socket
  await Promise.all(
    admins.map(async (a) => {
      const adminId = Number(a.id);

      const [result] = await db.query(
        `
        INSERT INTO notifications (user_id, type, message, data, is_read)
        VALUES (?, ?, ?, ?, 0)
        `,
        [adminId, "evaluation", message, JSON.stringify(data)]
      );

      const notif = {
        id: result.insertId,
        user_id: adminId,
        type: "evaluation",
        message,
        data: JSON.stringify(data),
        is_read: 0,
        created_at: new Date(),
      };

      io.to(`user:${adminId}`).emit("notifications:new", notif);
    })
  );
}
