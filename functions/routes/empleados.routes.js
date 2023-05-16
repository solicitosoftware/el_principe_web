const { Router } = require("express");
const router = Router();
const { firebase } = require("../firebase/firebase");

router.get("/api/getEmpleados", async (request, response) => {
  try {
    const values = await firebase
      .collection("empleados")
      .orderBy("nombre", "asc")
      .get();
    const empleados = values.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    return response.status(200).json(empleados);
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.post("/api/createEmpleado/:usuario_id", async (request, response) => {
  try {
    const result = await firebase
      .collection("empleados")
      .doc(request.params.usuario_id)
      .set({
        nombre: request.body.nombre,
        correo: request.body.correo,
        estado: request.body.estado,
        telefono: request.body.telefono,
        sede: request.body.sede,
        rol: request.body.rol,
      });
    return response.status(200).json(result);
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.put("/api/updateEmpleado/:empleado_id", async (request, response) => {
  try {
    const document = firebase
      .collection("empleados")
      .doc(request.params.empleado_id);
    await document.update({
      nombre: request.body.nombre,
      estado: request.body.estado,
      telefono: request.body.telefono,
      sede: request.body.sede,
      rol: request.body.rol,
    });
    return response.status(200).json();
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.delete("/api/deleteEmpleado/:empleado_id", async (request, response) => {
  try {
    const document = firebase
      .collection("empleados")
      .doc(request.params.empleado_id);
    await document.delete();
    return response.status(200).json();
  } catch (error) {
    return response.status(500).json(error);
  }
});

module.exports = router;
