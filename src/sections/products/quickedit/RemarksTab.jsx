import PropTypes from "prop-types";
import {
    useRef,
    useState,
    useEffect,
    useCallback,
} from "react";

import {
    Paper,
    Stack,
    Avatar,
    Divider,
    Tooltip,
    TextField,
    IconButton,
    Typography,
    CircularProgress,
} from "@mui/material";

import {
    createRemark,
    updateRemark,
    getProductRemarks,
} from "src/services/productRemark.service";

import Iconify from "src/components/iconify";

import SectionLabel from "./SectionLabel";

export default function RemarksTab({ productId, }) {
    const messagesEndRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [remarks, setRemarks] = useState([]);
    const [remark, setRemark] = useState("");
    const [editingId, setEditingId] = useState(null);
    const currentUser = JSON.parse(sessionStorage.getItem("user") || "{}");

    const scrollBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({
                behavior: "smooth",
            });
        }, 100);
    };

    const loadRemarks = useCallback(async () => {
        if (!productId) return;

        try {
            setLoading(true);

            const response =
                await getProductRemarks(
                    productId
                );

            setRemarks(
                response.data || []
            );
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        loadRemarks();
    }, [loadRemarks]);

    useEffect(() => {
        scrollBottom();
    }, [remarks]);

    const resetEditor = () => {
        setRemark("");
        setEditingId(null);
    };

    const handleSubmit = async () => {
        if (!remark.trim()) return;

        try {
            if (editingId) {
                await updateRemark(
                    editingId,
                    remark
                );
            } else {
                await createRemark(
                    productId,
                    remark
                );
            }

            resetEditor();

            loadRemarks();
        } catch (err) {
            console.error(err);
        }
    };

    const formatTime = (timestamp) =>
        new Date(timestamp).toLocaleString([], {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const formatDate = (timestamp) =>
        new Date(timestamp).toLocaleDateString(
            [],
            {
                weekday: "long",
                month: "short",
                day: "numeric",
            }
        );

    return (
        <Stack
            spacing={2}
            sx={{
                height: "100%",
            }}
        >
            {/* ========================= */}
            {/* Conversation */}
            {/* ========================= */}

            <Paper
                variant="outlined"
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "#f5f7fb",
                    backgroundImage:
                        "radial-gradient(rgba(0,0,0,.025) 1px, transparent 1px)",
                    backgroundSize: "18px 18px",
                }}
            >

                <SectionLabel>
                    Conversation
                </SectionLabel>

                <Divider sx={{ mb: 3 }} />

                {/* Loading */}

                {loading && (

                    <Stack
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                            py: 8,
                        }}
                    >

                        <CircularProgress />

                    </Stack>

                )}

                {/* Empty */}

                {!loading &&
                    remarks.length === 0 && (

                        <Stack
                            spacing={2}
                            alignItems="center"
                            sx={{
                                py: 8,
                            }}
                        >

                            <Avatar
                                sx={{
                                    width: 70,
                                    height: 70,
                                    bgcolor: "grey.300",
                                }}
                            >

                                <Iconify
                                    icon="mdi:chat-outline"
                                    width={36}
                                />

                            </Avatar>

                            <Typography
                                variant="h6"
                            >
                                No Remarks Yet
                            </Typography>

                            <Typography
                                color="text.secondary"
                                align="center"
                            >
                                Start the discussion by adding
                                the first remark.
                            </Typography>

                        </Stack>

                    )}

                {/* Messages */}

                {!loading &&
                    remarks.length > 0 && (

                        <Stack spacing={3}>

                            <Stack
                                alignItems="center"
                            >

                                <Paper
                                    sx={{
                                        px: 2,
                                        py: .75,
                                        bgcolor: "grey.200",
                                        borderRadius: 5,
                                    }}
                                >

                                    <Typography
                                        variant="caption"
                                        fontWeight={600}
                                    >
                                        {formatDate(
                                            remarks[0].created_at
                                        )}
                                    </Typography>

                                </Paper>

                            </Stack>
                            {remarks.map((item) => {

                                const isMine = item.user_id === currentUser.user_id;

                                const username = [
                                    item.users?.first_name,
                                    item.users?.last_name,
                                ]
                                    .filter(Boolean)
                                    .join(" ");

                                const initials = [
                                    item.users?.first_name?.[0],
                                    item.users?.last_name?.[0],
                                ]
                                    .filter(Boolean)
                                    .join("");

                                return (

                                    <Stack
                                        key={item.id}
                                        direction="row"
                                        justifyContent={
                                            isMine
                                                ? "flex-end"
                                                : "flex-start"
                                        }
                                        alignItems="flex-end"
                                        spacing={1}
                                    >

                                        {/* Avatar (Others Only) */}

                                        {!isMine && (

                                            <Avatar
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                }}
                                            >
                                                {initials}
                                            </Avatar>

                                        )}

                                        {/* Bubble */}

                                        <Paper
                                            elevation={1}
                                            sx={{

                                                position: "relative",

                                                maxWidth: "72%",

                                                px: 2,

                                                py: 1.5,

                                                borderRadius: 3,

                                                bgcolor: isMine
                                                    ? "#dcf8c6"
                                                    : "#fff",

                                                transition:
                                                    ".2s",

                                                "&:hover .actions": {
                                                    opacity: 1,
                                                },

                                            }}
                                        >

                                            {/* Name */}

                                            {!isMine && (

                                                <Typography
                                                    variant="subtitle2"
                                                    color="primary.main"
                                                    sx={{
                                                        mb: .5,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {username}
                                                </Typography>

                                            )}

                                            {/* Remark */}

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    whiteSpace:
                                                        "pre-wrap",
                                                    lineHeight: 1.8,
                                                }}
                                            >
                                                {item.remark}
                                            </Typography>

                                            {/* Footer */}

                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                justifyContent="flex-end"
                                                alignItems="center"
                                                sx={{
                                                    mt: 1,
                                                }}
                                            >

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {formatTime(
                                                        item.created_at
                                                    )}
                                                </Typography>

                                                {isMine && (

                                                    <Iconify
                                                        icon="mdi:check-all"
                                                        width={16}
                                                        color="#4fc3f7"
                                                    />

                                                )}

                                            </Stack>


                                        </Paper>

                                        {/* Avatar (Mine Only) */}

                                        {isMine && (

                                            <Avatar
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    bgcolor:
                                                        "primary.main",
                                                }}
                                            >
                                                Y
                                            </Avatar>

                                        )}

                                    </Stack>

                                );

                            })}

                            <div ref={messagesEndRef} />

                        </Stack>

                    )}

            </Paper>

            {/* ========================= */}
            {/* Message Input */}
            {/* ========================= */}

            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    borderRadius: 3,
                    position: "sticky",
                    bottom: 0,
                    bgcolor: "background.paper",
                }}
            >

                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="flex-end"
                >

                    <TextField
                        fullWidth
                        multiline
                        minRows={1}
                        maxRows={5}
                        placeholder={
                            editingId
                                ? "Edit your remark..."
                                : "Write a remark..."
                        }
                        value={remark}
                        onChange={(e) =>
                            setRemark(e.target.value)
                        }
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 5,
                            },
                        }}
                    />

                    {editingId && (
                        <Tooltip title="Cancel Edit">

                            <IconButton
                                color="inherit"
                                onClick={resetEditor}
                            >

                                <Iconify
                                    icon="mdi:close"
                                    width={22}
                                />

                            </IconButton>

                        </Tooltip>
                    )}

                    <Tooltip
                        title={
                            editingId
                                ? "Update Remark"
                                : "Send Remark"
                        }
                    >

                        <span>

                            <IconButton
                                color="primary"
                                disabled={!remark.trim()}
                                onClick={handleSubmit}
                                sx={{
                                    width: 52,
                                    height: 52,
                                    bgcolor: "primary.main",
                                    color: "#fff",

                                    "&:hover": {
                                        bgcolor: "primary.dark",
                                    },

                                    "&.Mui-disabled": {
                                        bgcolor: "grey.300",
                                        color: "grey.500",
                                    },
                                }}
                            >

                                <Iconify
                                    icon={
                                        editingId
                                            ? "mdi:content-save"
                                            : "mdi:send"
                                    }
                                    width={22}
                                />

                            </IconButton>

                        </span>

                    </Tooltip>

                </Stack>

            </Paper>

        </Stack>
    );
}

RemarksTab.propTypes = {
    productId: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]).isRequired,
};