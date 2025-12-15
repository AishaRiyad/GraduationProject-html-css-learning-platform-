import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from "react-native";

export default function PropertyGalleryMobile({ sec, assets }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!sec) return null;

const tableImages = {
  "border-collapse": require("../../assets/tables_border-collapse.png"),
  "cellpadding-cellspacing": require("../../assets/tables_cellpadding_cellspacing.png"),
  alignments: require("../../assets/tables_alignments.png"),
  "table-layout": require("../../assets/tables_table-layout.png"),
  span: require("../../assets/tables_rowspan_colspan.png"),
  striped: require("../../assets/tables_striped_rows.png"),
  sticky: require("../../assets/tables_sticky_header.png"),
  responsive: require("../../assets/tables_responsive_wrapper.png"),
};




  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{sec.heading}</Text>
      <Text style={styles.note}>{sec.note}</Text>

      {/* PROPERTY CARDS */}
      <View style={styles.grid}>
        {sec.properties?.map((prop, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => setOpenIndex(idx)}
            style={styles.card}
          >
            <Text style={styles.cardText}>{prop.name}</Text>
            <Text style={styles.arrow}>▼</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* MODAL POPUP */}
      <Modal visible={openIndex !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView>

              {/* CLOSE BUTTON */}
              <TouchableOpacity
                onPress={() => setOpenIndex(null)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>

              {openIndex !== null && (() => {
  const prop = sec.properties[openIndex];
  const file = tableImages[prop.imageId]; // ← الحل هنا

  return (
    <View>
      <Text style={styles.modalTitle}>{prop.name}</Text>

      <Text style={styles.modalDesc}>{prop.desc}</Text>

      <View style={styles.codeBox}>
        <Text style={styles.codeText}>{prop.code}</Text>
      </View>

      {file && (
        <Image
          source={file}
          style={styles.image}
          resizeMode="contain"
        />
      )}

      <Text style={styles.typeText}>{prop.type?.toUpperCase()}</Text>
    </View>
  );
})()}

            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#fffef5",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginBottom: 25,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#064F54",
    marginBottom: 10,
  },

  note: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    backgroundColor: "#fffdf3",
    borderWidth: 1,
    borderColor: "#E7E3A8",
    borderRadius: 14,
    padding: 14,
    width: "48%",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#064F54",
  },

  arrow: {
    color: "#666",
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalBox: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },

  closeBtn: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 20,
  },

  closeText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#555",
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: "#064F54",
    marginBottom: 10,
  },

  modalDesc: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
    lineHeight: 20,
  },

  codeBox: {
    backgroundColor: "#FFFBEA",
    borderWidth: 1,
    borderColor: "#F4C430",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },

  codeText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#333",
  },

  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 10,
  },

  typeText: {
    fontSize: 12,
    textAlign: "center",
    color: "#999",
    marginBottom: 15,
  },
});
