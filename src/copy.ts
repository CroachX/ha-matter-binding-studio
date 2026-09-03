export type Language = "zh-Hant" | "en";

const zhHant = {
  appName: "Matter Binding Studio",
  subtitle: "以 Home Assistant 名稱檢視原生 Matter Binding",
  readOnly: "唯讀驗證階段",
  refresh: "重新整理",
  refreshing: "更新中…",
  scope:
    "此版本只讀取原生 Matter 的 Binding、群組與已快取的容量；不會建立或變更 Binding、群組、ACL 或 Group Key。",
  loading: "正在讀取 Matter Fabric…",
  readFailed: "目前無法讀取 Matter Fabric，請稍後重新整理。",
  notConnected: "此預覽尚未連接到 Home Assistant。",
  controlRelationships: "控制關係",
  relationshipDescription: "以 Home Assistant 裝置名稱呈現的既有原生 Matter Binding。",
  noRelationships: "沒有讀到可呈現的控制關係。",
  direct: "直接連線",
  nativeGroup: "原生群組",
  members: "個目標",
  controlSets: "原生控制組",
  controlSetsDescription:
    "由裝置快取的 Groups table 推得。這個階段不會宣告或變更任何群組的擁有權。",
  noControlSets: "沒有讀到可呈現的原生控制組。",
  activeRelationships: "條使用中的關係",
  capacity: "群組與 Group Key 容量",
  capacityDescription:
    "裝置回報且已快取的限制。未來的群組廣播建立前會先做容量預檢。",
  groups: "群組",
  groupKeys: "Group Key",
  unavailable: "尚未取得",
  onOff: "開關",
  brightness: "亮度",
  colorTemperature: "色溫",
};

const en: typeof zhHant = {
  appName: "Matter Binding Studio",
  subtitle: "Inspect native Matter bindings with Home Assistant names",
  readOnly: "Read-only validation",
  refresh: "Refresh",
  refreshing: "Refreshing…",
  scope:
    "This version only reads native Matter bindings, groups, and cached capacity. It does not create or change a binding, group, ACL, or Group Key.",
  loading: "Reading the Matter fabric…",
  readFailed: "Matter Fabric could not be read. Please try refreshing again.",
  notConnected: "This preview is not connected to Home Assistant.",
  controlRelationships: "Control relationships",
  relationshipDescription:
    "Existing native Matter bindings, shown with Home Assistant device names.",
  noRelationships: "No readable control relationships were found.",
  direct: "Direct",
  nativeGroup: "Native group",
  members: "targets",
  controlSets: "Native control sets",
  controlSetsDescription:
    "Derived from cached device Groups tables. Studio does not claim or change ownership of any group in this stage.",
  noControlSets: "No readable native control sets were found.",
  activeRelationships: "active relationships",
  capacity: "Group and Group Key capacity",
  capacityDescription:
    "Cached device-reported limits. A future groupcast action will preflight this capacity before making changes.",
  groups: "Groups",
  groupKeys: "Group Keys",
  unavailable: "Unavailable",
  onOff: "On / Off",
  brightness: "Brightness",
  colorTemperature: "Color temperature",
};

export const copy = { "zh-Hant": zhHant, en };
export type Copy = typeof zhHant;
