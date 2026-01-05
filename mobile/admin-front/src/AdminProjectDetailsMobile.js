import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import ProjectDetailsScreen from "../../components/ProjectDetailsScreen";


export default function AdminProjectDetailsMobile({ navigation, route }) {
  const id = route?.params?.id;

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Project Details</Text>

      <View style={styles.card}>
        <ProjectDetailsScreen
          navigation={navigation}
          route={{ params: { id, adminMode: true } }}
          adminMode={true}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 12,
    backgroundColor: "#f9f9f9",
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#be185d",
    marginBottom: 10,
  },
  card: {
    borderWidth: 2,
    borderColor: "#fde047",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
  },
});
