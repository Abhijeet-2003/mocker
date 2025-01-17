import React, { useEffect, useState } from "react";
import {
  Button,
  CardContent,
  Typography,
  TextField,
  Stack,
  ListItem,
  ListItemAvatar,
  Avatar,
  List,
  Box,
} from "@mui/material";
import { FaPlus } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { blue } from "@mui/material/colors";
import { apiProject } from "../../services/models/projectModel";
import CustomModal from "../../components/CustomModal";
import { FiTrash } from "react-icons/fi";
import * as Yup from "yup";
import { useFormik } from "formik";
import ConfirmDeleteModal from "./components/ConfirmDelProjectModal";
import { PartLoader } from "../../components/CustomLoading";

const Dashboard = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [toBeDeleted, setToBeDeleted] = useState({});

  const initialValues = {
    name: "",
    submit: null,
  }; // form field value validation schema

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "Project should be of minimum 3 characters length")
      .max(25)
      .required("Project Name is required"),
  });

  const { errors, values, touched, handleBlur, handleChange, handleSubmit } =
    useFormik({
      initialValues,
      validationSchema,
      onSubmit: (values) => {
        addProject(values.name);
      },
    });

  const addProject = (name) => {
    const body = {
      name: name,
      userId: userId,
    };

    apiProject.post(body).then((res) => {
      if (res.status === "200") {
        toast.success(res.message);
        setOpen(false);
        values.name = "";
        fetchProjects();
      } else {
        toast.error(res.message);
      }
    });
  };

  const fetchProjects = () => {
    const ac = new AbortController();
    const signal = ac.signal;
    apiProject.getSingle(userId, signal).then((res) => {
      if (res.status === "200") {
        // console.log(res);
        setLoading(false);
        setProjects(res.message);
      } else {
        toast.error("Error !");
        setLoading(false);
      }
    });
    return () => ac.abort();
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const delProject = (id) => {
    toast("Deleting !");
    apiProject.remove(id).then((res) => {
      if (res.status === "200") {
        fetchProjects();
      }
    });
    setConfirmDeleteModal(false);
  };

  return (
    <React.Fragment>
      <CardContent>
        <Stack direction="row" spacing={2}>
          <Typography variant="h5" component="h1" color="primary">
            Projects
          </Typography>
          <Button
            color="primary"
            variant="contained"
            size="small"
            sx={{ borderRadius: "50ex", py: 0.2, px: 1.2, minWidth: 0 }}
            onClick={() => setOpen(true)}
          >
            <FaPlus size={"0.8rem"} />
          </Button>
        </Stack>
        {loading ? (
          <PartLoader />
        ) : (
          <List>
            {Array.isArray(projects) &&
              projects.map((project) => (
                <ListItem
                  sx={{ justifyContent: "space-between" }}
                  key={project._id}
                >
                  <Box
                    sx={{ display: "flex", cursor: "pointer" }}
                    onClick={() =>
                      navigate(`/dashboard/${userId}/${project._id}`)
                    }
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: blue[500],
                          ":hover": { bgcolor: blue[800] },
                        }}
                      >
                        {project?.name?.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <Typography
                      sx={{
                        display: "inline",
                        mt: 1,
                        ":hover": { color: blue[800] },
                      }}
                      component="h1"
                      variant="h6"
                      color="text.primary"
                    >
                      {project.name}
                    </Typography>
                  </Box>
                  <Button
                    color="error"
                    variant="contained"
                    onClick={() => {
                      setToBeDeleted(project);
                      setConfirmDeleteModal(true);
                    }}
                  >
                    <FiTrash color="#fff" />
                  </Button>
                </ListItem>
              ))}
          </List>
        )}
      </CardContent>
      {open && (
        <CustomModal open={open} setOpen={setOpen} title="New Project">
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Project name"
              type="text"
              name="name"
              sx={{ mb: 3 }}
              size="small"
              fullWidth
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.name || ""}
              error={Boolean(touched.name && errors.name)}
              helperText={touched.name && errors.name}
            />
            <Stack direction="row" spacing={3}>
              <Button variant="contained" size="small" type="submit">
                Create
              </Button>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={() => {
                  setOpen(false);
                  setName("");
                }}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        </CustomModal>
      )}
      <ConfirmDeleteModal
        confirmDeleteModal={confirmDeleteModal}
        setConfirmDeleteModal={setConfirmDeleteModal}
        project={toBeDeleted}
        deleteProject={delProject}
      />
    </React.Fragment>
  );
};

export default Dashboard;
