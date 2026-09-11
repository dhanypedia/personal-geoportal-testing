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
  Chip,
  IconButton,
  Tooltip,
  Link,
  Modal,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import TambahData from "./TambahData";
import PreviewCesiumModal from "./PreviewCesiumModal";
import { Close, Visibility } from "@mui/icons-material";
import { useSession } from "next-auth/react";

export default function KatalogData3D({ data }) {
  const [tableData, setTableData] = useState(data);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [previewItem, setPreviewItem] = useState(null);

  const [openPreview, setOpenPreview] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({ nama: "", file: null, akses: "public" });

  const session = useSession();

  // Fungsi Fetch Ulang Data dari Endpoint GET
  const refreshData = async () => {
    try {
      const res = await fetch(`${process.env.BASE_URL}/api/katalog-data-3d/list`, {
        headers: {
          Authorization: `Bearer ${session?.data?.accessToken}`,
        },
      });
      if (res.ok) {
        const result = await res.json();
        setTableData(result.data || result);
      }
    } catch (err) {
      console.error("Gagal memperbarui data tabel:", err);
    }
  };

  useEffect(() => {
    if (!search.trim()) {
      setFilteredData(tableData);
      return;
    }
    const query = search.toLowerCase();
    const result = tableData.filter((item) => {
      return item.nama?.toLowerCase().includes(query);
    });
    setFilteredData(result);
  }, [search, tableData]);

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
        <Typography variant="h5" fontWeight={700} sx={{ color: "#1E1E2D" }}>
          Katalog Data 3D
        </Typography>

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
        placeholder="Cari nama layer..."
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
                    {row.users?.email || "-"}
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
                        <Visibility fontSize="small" />
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
      <Modal open={openCreate} onClose={handleCloseCreate} aria-labelledby="modal-tambah-data-3d">
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 600, md: 700 },
            bgcolor: "#fff",
            color: "#1E1E2D",
            borderRadius: 3,
            boxShadow: 24,
            p: 3,
            outline: "none",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography id="modal-tambah-data-3d" variant="h6" sx={{ fontWeight: 700, color: "#1E1E2D" }}>
              Tambah Layer Data 3D
            </Typography>
            <IconButton onClick={handleCloseCreate} size="small" sx={{ color: "#6B7280" }}>
              <Close />
            </IconButton>
          </Box>

          <TambahData
            form={form}
            setForm={setForm}
            handleCloseCreate={handleCloseCreate}
            onSuccess={refreshData}
            accessToken={session?.data?.accessToken}
          />
        </Box>
      </Modal>

      {/* Modal Preview Cesium */}
      <PreviewCesiumModal
        open={openPreview}
        onClose={handleClosePreview}
        item={previewItem}
      />
    </Box>
  );
}