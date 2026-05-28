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
  {
    icon: <HomeIcon fontSize="small" />,
    labelKey: "nav.home",
    label: "Asosiy",
    path: "/dashboard",
  },
  {
    icon: <PeopleIcon fontSize="small" />,
    labelKey: "nav.teachers",
    label: "O'qituvchilar",
    path: "/dashboard/teachers",
  },
  {
    icon: <LayersIcon fontSize="small" />,
    labelKey: "nav.groups",
    label: "Guruhlar",
    path: "/dashboard/groups",
  },
  {
    icon: <SchoolIcon fontSize="small" />,
    labelKey: "nav.students",
    label: "Talabalar",
    path: "/dashboard/students",
  },
  {
    icon: <CardGiftcardIcon fontSize="small" />,
    labelKey: "nav.payments",
    label: "To'lovlar",
    path: "/dashboard/payments",
  },
  {
    icon: <TuneIcon fontSize="small" />,
    labelKey: "nav.settings",
    label: "Boshqarish",
    path: "/settings",
  },
];

export const BOSHQARISH_MENU = [
  {
    icon: <AutoStoriesIcon fontSize="small" />,
    labelKey: "nav.courses",
    label: "Kurslar",
    path: "/dashboard/courses",
  },
  {
    icon: <MeetingRoomIcon fontSize="small" />,
    labelKey: "nav.rooms",
    label: "Xonalar",
    path: "/dashboard/rooms",
  },
  {
    icon: <BadgeIcon fontSize="small" />,
    labelKey: "nav.staff",
    label: "Hodimlar",
    path: "/dashboard/staff",
  },
  {
    icon: <MonetizationOnIcon fontSize="small" />,
    labelKey: "nav.coin",
    label: "Coin",
    path: "/dashboard/coins",
  },
  {
    icon: <SendIcon fontSize="small" />,
    labelKey: "nav.messages",
    label: "Xabar Yuborish",
    path: "/dashboard/messages",
  },
];

export const BOSHQARISH_TABS = [
  { labelKey: "nav.courses", label: "Kurslar", path: "/dashboard/courses" },
  { labelKey: "nav.rooms", label: "Xonalar", path: "/dashboard/rooms" },
  { labelKey: "nav.staff", label: "Hodimlar", path: "/dashboard/staff" },
];
