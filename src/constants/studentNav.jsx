import HomeIcon from "@mui/icons-material/Home";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import GroupsIcon from "@mui/icons-material/Groups";
import BarChartIcon from "@mui/icons-material/BarChart";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PodcastsIcon from "@mui/icons-material/Podcasts";
import SettingsIcon from "@mui/icons-material/Settings";

// Student kabineti navigatsiyasi (rasmga mos)
export const STUDENT_NAV = [
  { icon: <HomeIcon fontSize="small" />,        labelKey: "sp.nav_home",       path: "/student" },
  { icon: <CreditCardIcon fontSize="small" />,  labelKey: "sp.nav_payments",   path: "/student/payments" },
  { icon: <GroupsIcon fontSize="small" />,      labelKey: "sp.nav_groups",     path: "/student/my-groups" },
  { icon: <BarChartIcon fontSize="small" />,    labelKey: "sp.nav_indicators", path: "/student/indicators" },
  { icon: <LeaderboardIcon fontSize="small" />, labelKey: "sp.nav_rating",     path: "/student/rating" },
  { icon: <ShoppingCartIcon fontSize="small" />,labelKey: "sp.nav_shop",       path: "/student/shop" },
  { icon: <PodcastsIcon fontSize="small" />,    labelKey: "sp.nav_extra",      path: "/student/extra" },
  { icon: <SettingsIcon fontSize="small" />,    labelKey: "sp.nav_settings",   path: "/student/settings" },
];
