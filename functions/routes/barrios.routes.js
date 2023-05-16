const { Router } = require("express");
const router = Router();
const { firebase } = require("../firebase/firebase");

router.get("/api/getBarrios", async (request, response) => {
  try {
    const values = await firebase
      .collection("barrios")
      .orderBy("nombre", "asc")
      .get();
    const barrios = values.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    return response.status(200).json(barrios);
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.post("/api/createBarrio", async (request, response) => {
  try {
    const result = await firebase.collection("barrios").add(request.body.data);
    return response.status(200).json(result);
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.put("/api/updateBarrio/:barrios_id", async (request, response) => {
  try {
    const document = firebase
      .collection("barrios")
      .doc(request.params.barrios_id);
    await document.update({
      nombre: request.body.nombre,
      valor: request.body.valor,
    });
    return response.status(200).json();
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.delete("/api/deleteBarrio/:barrio_id", async (request, response) => {
  try {
    const document = firebase
      .collection("barrios")
      .doc(request.params.barrio_id);
    await document.delete();
    return response.status(200).json();
  } catch (error) {
    return response.status(500).json(error);
  }
});

module.exports = router;
