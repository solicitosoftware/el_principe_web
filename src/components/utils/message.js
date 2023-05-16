import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button, FormGroup, Input } from "reactstrap";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import "../../css/general.css";
import { useFormik } from "formik";
import * as Yup from "yup";

//componente de mensajes
function Messages({
  title,
  mensaje,
  abrir,
  cerrar,
  procesar,
  comentario,
  confirmar,
}) {
  const [open, setOpen] = useState(abrir);

  const [aceptar, setAceptar] = useState(confirmar);

  const formik = useFormik({
    initialValues: {
      comentario: "",
    },
    validationSchema: Yup.object({
      comentario: Yup.string().min(6, "El comentario debe ser mas largo"),
    }),
  });

  useEffect(() => {
    setOpen(abrir);
  }, [abrir]);

  useEffect(() => {
    setAceptar(confirmar);
  }, [confirmar]);

  function limpiarState() {
    setTimeout(() => {
      formik.values.comentario = "";
      formik.errors = {};
    }, 100);
  }

  const hadleCerrar = () => {
    limpiarState();
    cerrar();
  };

  const hableGuardar = () => {
    if (comentario) {
      procesar(formik.values.comentario);
    } else {
      procesar();
    }
    hadleCerrar();
  };

  return (
    <Dialog open={open} aria-labelledby="draggable-dialog-title">
      <DialogTitle
        className="text-center p-1 text-white text-xs mb-3"
        style={{ backgroundColor: "#dc291a" }}
      >
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{mensaje}</DialogContentText>
        {comentario && (
          <FormGroup>
            <Input
              type="text"
              id="comentario"
              value={formik.values.comentario}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </FormGroup>
        )}
        {formik.touched.comentario && formik.errors.comentario ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-2">
            <p className="mb-0">{formik.errors.comentario}</p>
          </div>
        ) : null}
      </DialogContent>
      <DialogActions>
        <div className="modal-boton">
          <Button size="sm" onClick={hadleCerrar}>
            Cerrar
          </Button>
        </div>
        {aceptar && (
          <div className="modal-boton">
            <Button size="sm" onClick={hableGuardar}>
              Aceptar
            </Button>
          </div>
        )}
      </DialogActions>
    </Dialog>
  );
}

Messages.propTypes = {
  title: PropTypes.string.isRequired,
  mensaje: PropTypes.string.isRequired,
  abrir: PropTypes.bool.isRequired,
  comentario: PropTypes.bool.isRequired,
};

Messages.defaultProps = {
  abrir: false,
  comentario: false,
};

export default Messages;
