import { Tabs } from "antd";
import React from "react";

export default function TabbedItems({ activeKey, items }) {
  return (
    <Tabs
      className="music-tabs"
      defaultActiveKey="1"
      activeKey={activeKey}
      items={items}
    />
  );
}
