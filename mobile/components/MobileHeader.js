import { View, Text, TouchableOpacity, Image, StyleSheet, StatusBar } from "react-native";

export default function MobileHeader({ navigation, onMenuPress }) {
  return (
    <View style={styles.header}>
      <StatusBar barStyle="dark-content" backgroundColor="#fef9c3" />

      <View style={styles.left}>
        <Image
          source={require("../assets/user-avatar.jpg")}
          style={styles.avatar}
        />
      </View>

      <Text style={styles.logo}>
        <Text style={{ color: "black" }}>HT</Text>
        <Text style={{ color: "#facc15" }}>ML</Text>
      </Text>

      <TouchableOpacity onPress={onMenuPress}>
  <Text style={styles.menu}>☰</Text>
</TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: StatusBar.currentHeight +1, // ⬅⬅⬅ نزل الهيدر
    paddingBottom: 10,
    paddingHorizontal: 15,

    backgroundColor: "#fef9c3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    elevation: 5,
  },
  left: {
    width: 40,
    height: 40,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "black",
    padding: 5,
  },
  logo: {
    fontSize: 22,
    fontWeight: "bold",
  },
  menuIcon: {
    width: 28,
    height: 28,
  },
  menu: {
  fontSize: 30,
  fontWeight: "bold",
  color: "black",
  paddingHorizontal: 10,
}

});

