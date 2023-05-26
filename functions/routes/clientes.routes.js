const { Router } = require("express");
const router = Router();
const { firebase } = require("../firebase/firebase");

router.post("/api/createCliente/:cliente_id", async (request, response) => {
  try {
    const result = await firebase
      .collection("clientes")
      .doc(request.params.cliente_id)
      .set(request.body.data);
    return response.status(200).json(result);
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.put("/api/getCliente/:cliente_id", async (request, response) => {
  try {
    const document = await firebase
      .collection("clientes")
      .doc(request.params.cliente_id)
      .get();
    const cliente = {
      id: document.id,
      data: { ...document.data() },
    };
    return response.status(200).json(cliente);
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.put("/api/updateCliente/:cliente_id", async (request, response) => {
  try {
    const document = firebase
      .collection("clientes")
      .doc(request.params.cliente_id);
    await document.update({
      nombre: request.body.nombre,
      telefono: request.body.telefono,
      telefono2: request.body.telefono2,
      municipio: request.body.municipio,
      municipio2: request.body.municipio2,
      municipio3: request.body.municipio3,
      municipio4: request.body.municipio4,
      barrio: request.body.barrio,
      barrio2: request.body.barrio2,
      barrio3: request.body.barrio3,
      barrio4: request.body.barrio4,
      puntoRef: request.body.puntoRef,
      puntoRef2: request.body.puntoRef2,
      puntoRef3: request.body.puntoRef3,
      puntoRef4: request.body.puntoRef4,
      direccion: request.body.direccion,
      direccion2: request.body.direccion2,
      direccion3: request.body.direccion3,
      direccion4: request.body.direccion4,
    });
    return response.status(200).json();
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.delete("/api/deleteCliente/:cliente_id", async (request, response) => {
  try {
    const document = firebase
      .collection("clientes")
      .doc(request.params.cliente_id);
    await document.delete();
    return response.status(200).json();
  } catch (error) {
    return response.status(500).json(error);
  }
});

module.exports = router;
