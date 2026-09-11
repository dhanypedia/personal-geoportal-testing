"use client";

import { useEffect, useRef } from "react";
import { Dialog, DialogTitle, DialogContent, IconButton, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Impor CSS Cesium langsung dari node_modules
import "cesium/Build/Cesium/Widgets/widgets.css";

export default function PreviewCesiumModal({ open, onClose, item }) {
    const containerRef = useRef(null);
    const viewerRef = useRef(null);

    useEffect(() => {
        if (!open || !item || !containerRef.current) return;

        let isMounted = true;

        // Load Cesium secara dinamis dari package npm agar berjalan di Client-side Next.js
        const initCesium = async () => {
            try {
                const Cesium = await import("cesium");

                // Set Base URL untuk aset Cesium (seperti worker, static assets, dll.)
                window.CESIUM_BASE_URL = "/cesium";

                if (!isMounted || !containerRef.current) return;

                // Hapus instance viewer lama jika ada
                if (viewerRef.current && !viewerRef.current.isDestroyed()) {
                    viewerRef.current.destroy();
                }

                // Inisialisasi Cesium Viewer
                const viewer = new Cesium.Viewer(containerRef.current, {
                    timeline: false,
                    animation: false,
                    baseLayerPicker: true,
                    fullscreenButton: false,
                    geocoder: false,
                    homeButton: false,
                    sceneModePicker: false,
                    navigationHelpButton: false,
                });

                viewerRef.current = viewer;

                // Georeferensi Koordinat
                const lat = item.latitude || 0;
                const lon = item.longitude || 0;
                const alt = item.altitude || 10;
                const position = Cesium.Cartesian3.fromDegrees(lon, lat, alt);

                // Georeferensi Orientasi (Rotasi)
                const heading = Cesium.Math.toRadians(item.heading || 0);
                const pitch = Cesium.Math.toRadians(item.pitch || 0);
                const roll = Cesium.Math.toRadians(item.roll || 0);
                const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
                const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

                // Tambahkan Model .GLB
                const entity = viewer.entities.add({
                    name: item.nama || "Model 3D",
                    position: position,
                    orientation: orientation,
                    model: {
                        uri: item.url,
                        minimumPixelSize: 128,
                        maximumScale: 20000,
                    },
                });

                // Terbang / Zoom ke arah model
                viewer.flyTo(entity, { duration: 1.5 });
            } catch (error) {
                console.error("Gagal menginisialisasi Cesium:", error);
            }
        };

        initCesium();

        return () => {
            isMounted = false;
            if (viewerRef.current && !viewerRef.current.isDestroyed()) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
        };
    }, [open, item]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 3,
                        overflow: "hidden",
                        bgcolor: "#1E1E2D",
                        color: "#fff",
                    },
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    pr: 2,
                }}
            >
                Preview 3D: {item?.nama || "Model GLB"}
                <IconButton onClick={onClose} sx={{ color: "#fff" }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0, borderColor: "#333" }}>
                <Box
                    ref={containerRef}
                    sx={{
                        width: "100%",
                        height: "500px",
                        bgcolor: "#000",
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}