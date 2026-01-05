// admin-front/src/withAdminLayout.js
import React from "react";
import { useNavigation } from "@react-navigation/native";
import AdminLayoutMobile from "./AdminLayoutMobile";

export default function withAdminLayout(ScreenComponent) {
  return function WrappedAdminScreen(props) {
    const navigation = useNavigation();
    return (
      <AdminLayoutMobile navigation={navigation}>
        <ScreenComponent {...props} />
      </AdminLayoutMobile>
    );
  };
}
