"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  IconButton,
  Tooltip,
  Link,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import TambahData from "./TambahData";
import PreviewCesiumModal from "./PreviewCesiumModal";

export default function KatalogData3D({ data }) {
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [previewItem, setPreviewItem] = useState(null);

  const [openPreview, setOpenPreview] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  const [form, setForm] = useState({ nama: "", file: null, akses: "public", });

  useEffect(() => {
    if (!search.trim()) {
      setFilteredData(data.data);
      return;
    }
    const query = search.toLowerCase();
    const result = data.data.filter((item) => {
      const namaMatch = item.nama?.toLowerCase().includes(query);
      const userMatch =
        item.users?.name?.toLowerCase().includes(query) ||
        item.users?.username?.toLowerCase().includes(query);
      return namaMatch || userMatch;
    });

    setFilteredData(result);
  }, [search, data]);

  const handleOpenCreate = () => {
    setForm({ nama: "", file: null, akses: "public" });
    setOpenCreate(true);
  };

  const handleCloseCreate = () => {
    setForm({ nama: "", file: null, akses: "public" });
    setOpenCreate(false);
  };

  const handleOpenPreview = (item) => {
    setOpenPreview(true);
    setPreviewItem(item);
  };

  const handleClosePreview = () => {
    setOpenPreview(false);
    setPreviewItem(null);
  };

  return (
    <Box sx={{ p: 1 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: "#1E1E2D" }}>
            Katalog Data 3D
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{
            bgcolor: "#4F46E5",
            "&:hover": { bgcolor: "#4338CA" },
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            px: 2.5,
          }}
        >
          Tambah Layer 3D
        </Button>
      </Box>

      {/* Search Input */}
      <TextField
        placeholder="Cari nama layer atau pembuat..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          mb: 2,
          width: 320,
          bgcolor: "#1E1E2D",
          borderRadius: 2,
          "& .MuiOutlinedInput-notchedOutline": { border: "none" },
          "& .MuiInputBase-input": { color: "#fff" },
          "& .MuiInputBase-input::placeholder": { color: "#E5E7EB", opacity: 0.8 },
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: "#E5E7EB" }} />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Data Table */}
      <Paper
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid #E5E7EB",
          boxShadow: "0 1px 3px rgba(16,24,40,0.1)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                "& .MuiTableCell-root": {
                  bgcolor: "#1E1E2D",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: 0.3,
                },
              }}
            >
              <TableCell>Nama Layer</TableCell>
              <TableCell>URL File (.GLB)</TableCell>
              <TableCell>Koordinat (Lat, Long)</TableCell>
              <TableCell>Pembuat</TableCell>
              <TableCell>Akses</TableCell>
              <TableCell align="center">Aksi</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <TableRow
                  key={row.data_3d_id}
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell sx={{ fontWeight: 600, color: "#111827" }}>
                    {row.nama}
                  </TableCell>

                  <TableCell>
                    <Link
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      sx={{
                        color: "#4F46E5",
                        maxWidth: 220,
                        display: "inline-block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        verticalAlign: "middle",
                      }}
                    >
                      {row.url}
                    </Link>
                  </TableCell>

                  <TableCell sx={{ color: "#4B5563", fontSize: 13 }}>
                    {row.latitude?.toFixed(4)}, {row.longitude?.toFixed(4)}
                  </TableCell>

                  <TableCell sx={{ color: "#374151" }}>
                    {row.users?.name || row.users?.username || "System"}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={(row.akses || "private").toUpperCase()}
                      size="small"
                      color={row.akses === "public" ? "success" : "default"}
                      variant={row.akses === "public" ? "filled" : "outlined"}
                      sx={{ fontWeight: 600, fontSize: 11 }}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip title="Preview di Cesium">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenPreview(row)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Metadata">
                      <IconButton size="small" color="info">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Hapus Layer">
                      <IconButton size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    {search
                      ? "Tidak ada data 3D yang sesuai dengan pencarian."
                      : "Belum ada katalog data 3D."}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Modal Form Tambah Data */}
      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: "#fff",
              color: "#1E1E2D",
              borderRadius: 3,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#1E1E2D" }}>
          Tambah Layer Data 3D
        </DialogTitle>
        <DialogContent>
          <TambahData form={form} setForm={setForm} handleCloseCreate={handleCloseCreate}/>
        </DialogContent>
      </Dialog>

      {/* Modal Preview Cesium */}
      <PreviewCesiumModal
        open={openPreview}
        onClose={handleClosePreview}
        item={previewItem}
      />
    </Box>
  );
}