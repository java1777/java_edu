import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import LayersIcon from "@mui/icons-material/Layers";
import SchoolIcon from "@mui/icons-material/School";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import TuneIcon from "@mui/icons-material/Tune";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import BadgeIcon from "@mui/icons-material/Badge";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import SendIcon from "@mui/icons-material/Send";

export const NAV_ITEMS = [
  { icon: <HomeIcon fontSize="small" />, label: "Asosiy", path: "/dashboard" },
  {
    icon: <PeopleIcon fontSize="small" />,
    label: "O'qituvchilar",
    path: "/dashboard/teachers",
  },
  {
    icon: <LayersIcon fontSize="small" />,
    label: "Guruhlar",
    path: "/dashboard/groups",
  },
  {
    icon: <SchoolIcon fontSize="small" />,
    label: "Talabalar",
    path: "/dashboard/students",
  },
  {
    icon: <CardGiftcardIcon fontSize="small" />,
    label: "To'lovlar",
    path: "/dashboard/payments",
  },
  {
    icon: <TuneIcon fontSize="small" />,
    label: "Boshqarish",
    path: "/settings",
  },
];

export const BOSHQARISH_MENU = [
  {
    icon: <AutoStoriesIcon fontSize="small" />,
    label: "Kurslar",
    path: "/dashboard/courses",
  },
  {
    icon: <MeetingRoomIcon fontSize="small" />,
    label: "Xonalar",
    path: "/dashboard/rooms",
  },
  {
    icon: <BadgeIcon fontSize="small" />,
    label: "Hodimlar",
    path: "/dashboard/staff",
  },
  {
    icon: <MonetizationOnIcon fontSize="small" />,
    label: "Coin",
    path: "/dashboard/coins",
  },
  {
    icon: <SendIcon fontSize="small" />,
    label: "Xabar Yuborish",
    path: "/dashboard/messages",
  },
];

export const BOSHQARISH_TABS = [
  { label: "Kurslar", path: "/dashboard/courses" },
  { label: "Xonalar", path: "/dashboard/rooms" },
  { label: "Xodimlar", path: "/dashboard/staff" },
];
