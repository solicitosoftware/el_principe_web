const { Router } = require("express");
const router = Router();
const { firebase } = require("../firebase/firebase");

router.get("/api/getCategorias", async (request, response) => {
  try {
    const values = await firebase.collection("categorias").get();
    const categorias = values.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    return response.status(200).json(categorias);
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.post("/api/createCategoria", async (request, response) => {
  try {
    const result = await firebase
      .collection("categorias")
      .add(request.body.data);
    return response.status(200).json(result);
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.put("/api/updateCategoria/:categoria_id", async (request, response) => {
  try {
    const document = firebase
      .collection("categorias")
      .doc(request.params.categoria_id);
    await document.update({
      nombre: request.body.nombre,
      descripcion: request.body.descripcion,
      salsas: JSON.parse(request.body.salsas),
    });
    return response.status(200).json();
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.delete(
  "/api/deleteCategoria/:categoria_id",
  async (request, response) => {
    try {
      const document = firebase
        .collection("categorias")
        .doc(request.params.categoria_id);
      await document.delete();
      return response.status(200).json();
    } catch (error) {
      return response.status(500).json(error);
    }
  }
);

module.exports = router;
