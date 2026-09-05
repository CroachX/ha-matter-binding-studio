"""Constants for Matter Binding Studio."""

DOMAIN = "matter_binding_studio"

PANEL_NAME = "matter-binding-studio-panel"
PANEL_TITLE = "Matter Binding Studio"
PANEL_ICON = "mdi:transit-connection-variant"

WS_TYPE_GET_SNAPSHOT = f"{DOMAIN}/get_snapshot"
WS_TYPE_PREPARE_UNICAST = f"{DOMAIN}/prepare_unicast"
WS_TYPE_APPLY_UNICAST = f"{DOMAIN}/apply_unicast"
WS_TYPE_PREPARE_GROUPCAST = f"{DOMAIN}/prepare_groupcast"
WS_TYPE_APPLY_GROUPCAST = f"{DOMAIN}/apply_groupcast"
WS_TYPE_PREPARE_REMOVE_BINDING = f"{DOMAIN}/prepare_remove_binding"
WS_TYPE_APPLY_REMOVE_BINDING = f"{DOMAIN}/apply_remove_binding"
WS_TYPE_GET_ACL_OVERVIEW = f"{DOMAIN}/get_acl_overview"
WS_TYPE_PREPARE_REMOVE_ACL = f"{DOMAIN}/prepare_remove_acl"
WS_TYPE_APPLY_REMOVE_ACL = f"{DOMAIN}/apply_remove_acl"

CLUSTER_ACCESS_CONTROL = 0x001F
CLUSTER_BINDING = 0x001E
CLUSTER_COLOR_CONTROL = 0x0300
CLUSTER_DESCRIPTOR = 0x001D
CLUSTER_GROUPS = 0x0004
CLUSTER_GROUP_KEY_MANAGEMENT = 0x003F
CLUSTER_LEVEL_CONTROL = 0x0008
CLUSTER_ON_OFF = 0x0006
CLUSTER_OPERATIONAL_CREDENTIALS = 0x003E

ATTR_ACL = 0
ATTR_ACCESS_CONTROL_ENTRIES_PER_FABRIC = 4
ATTR_TARGETS_PER_ACCESS_CONTROL_ENTRY = 3
ATTR_BINDING = 0
ATTR_CURRENT_FABRIC_INDEX = 5
ATTR_GROUP_TABLE = 1
ATTR_GROUP_KEY_MAP = 0
ATTR_MAX_GROUP_KEYS_PER_FABRIC = 3
ATTR_MAX_GROUPS_PER_FABRIC = 2
ATTR_CLIENT_LIST = 2
ATTR_SERVER_LIST = 1

# Matter's application Group ID range excludes 0 (all groups) and 0xFFF8+
# (reserved).  Studio starts near the high end so it does not casually collide
# with user-created groups, which are normally allocated from the low end.
STUDIO_GROUP_ID_START = 0x8000
STUDIO_GROUP_ID_END = 0xFFF7
STUDIO_KEY_SET_ID_START = 0x0100
