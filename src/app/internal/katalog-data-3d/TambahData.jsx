import { Box, Button, MenuItem, TextField } from "@mui/material";
import UploadIcon from '@mui/icons-material/Upload';

const TambahData = ({ form, handleCloseCreate }) => {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
            <TextField
                label="Nama Layer"
                fullWidth
                value={form.layer_name}
                onChange={(e) => setForm((f) => ({ ...f, layer_name: e.target.value }))}
                sx={{
                    "& .MuiInputBase-input": { color: "#1E1E2D" },
                    "& .MuiInputLabel-root": { color: "#6B7280" },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#D1D5DB" },
                }}
            />

            <Button
                component="label"
                variant="outlined"
                startIcon={<UploadIcon />}
                sx={{
                    textTransform: "none",
                    justifyContent: "flex-start",
                    py: 1.2,
                    borderRadius: 2,
                    color: "#1E1E2D",
                    borderColor: "#D1D5DB",
                }}
            >
                {form.file ? form.file.name : "Pilih File 3D Tiles (.zip)"}
                <input
                    type="file"
                    accept=".zip"
                    hidden
                    onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] || null }))}
                />
            </Button>

            <TextField
                select
                label="Akses"
                fullWidth
                value={form.akses}
                onChange={(e) => setForm((f) => ({ ...f, akses: e.target.value }))}
                sx={{
                    "& .MuiInputBase-input": { color: "#1E1E2D" },
                    "& .MuiInputLabel-root": { color: "#6B7280" },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#D1D5DB" },
                }}
                slotProps={{
                    select: {
                        slotProps: {
                            paper: {
                                sx: { bgcolor: "#fff", color: "#1E1E2D" },
                            },
                        },
                    },
                }}
            >
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="private">Private</MenuItem>
            </TextField>
            <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "flex-end", gap: "5px" }}>
                <Button variant="contained" color="warning" onClick={handleCloseCreate}>Cancel</Button>
                <Button variant="contained" color="info">Submit</Button>
            </Box>
        </Box>
    )
}

export default TambahData;