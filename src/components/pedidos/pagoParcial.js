import { useFormik } from "formik";
import * as Yup from "yup";
import React, { useEffect, useState } from "react";
import NumberFormat from "react-number-format";
import {
  Button,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { formatearPrecio } from "../utils";
function PagoParcial({ modal, total, medioPago, guardar, detallePago }) {
  useEffect(() => {
    formik.setValues(formik.initialValues);
    if (medioPago != "parcial") {
      return formik.setFieldValue(medioPago, total, false);
    }
    if (detallePago) {
      formik.setFieldValue(
        "efectivo",
        total - detallePago.transferencia,
        false
      );
      formik.setFieldValue("transferencia", detallePago.transferencia, false);
    }
  }, [total, medioPago]);

  const formik = useFormik({
    initialValues: {
      efectivo: 0,
      transferencia: 0,
    },
    validationSchema: Yup.object({
      efectivo: Yup.number().required(),
      transferencia: Yup.number().required(),
    }),
    onSubmit: () => {
      guardar(formik.values);
    },
  });

  const calculo = ({ target }) => {
    let valor = formatearPrecio(target.value);
    if (valor > total) valor = total;
    formik.setFieldValue("transferencia", valor, false);
    formik.setFieldValue("efectivo", total - valor, false);
  };

  return (
    <Modal
      scrollable
      className="flex items-center"
      style={{ height: "90vh" }}
      isOpen={modal}
    >
      <ModalHeader className="modal-header">Pago Parcial</ModalHeader>
      <ModalBody>
        <FormGroup className="flex justify-between items-center m-3">
          <Label className="mr-5" for="efectivo">
            EFECTIVO
          </Label>
          <div className="w-1/4">
            <NumberFormat
              disabled
              customInput={Input}
              isNumericString={true}
              thousandSeparator={true}
              id="efectivo"
              prefix="$"
              value={formik.values.efectivo}
              onChange={(e) =>
                formik.setFieldValue(
                  "efectivo",
                  formatearPrecio(e.target.value),
                  false
                )
              }
            />
          </div>
        </FormGroup>
        <FormGroup className="flex justify-between items-center m-3">
          <Label className="mr-5" for="transferencia">
            TRANSFERENCIA
          </Label>
          <div className="w-1/4">
            <NumberFormat
              customInput={Input}
              isNumericString={true}
              thousandSeparator={true}
              id="transferencia"
              prefix="$"
              value={formik.values.transferencia}
              onChange={calculo}
            />
          </div>
        </FormGroup>
      </ModalBody>
      <ModalFooter className="flex justify-between">
        <div className="modal-boton">
          <Button onClick={formik.handleSubmit}>Confirmar</Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}

export default PagoParcial;
