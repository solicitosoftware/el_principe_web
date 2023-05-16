const { Router } = require("express");
const router = Router();
const { firebase } = require("../firebase/firebase");

router.get("/api/getProductos", async (request, response) => {
  try {
    const values = await firebase.collection("productos").get();
    const productos = values.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    return response.status(200).json(productos);
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.post("/api/createProducto", async (request, response) => {
  try {
    const result = await firebase
      .collection("productos")
      .add(request.body.data);
    return response.status(200).json(result);
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.put("/api/updateProducto/:producto_id", async (request, response) => {
  try {
    const document = firebase
      .collection("productos")
      .doc(request.params.producto_id);
    await document.update({
      nombre: request.body.nombre,
      precio: request.body.precio,
      categoria: request.body.categoria,
      estado: JSON.parse(request.body.estado),
      imagen: request.body.imagen,
      descripcion: request.body.descripcion,
      orden: request.body.orden,
    });
    return response.status(200).json();
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.delete("/api/deleteProducto/:producto_id", async (request, response) => {
  try {
    const document = firebase
      .collection("productos")
      .doc(request.params.producto_id);
    await document.delete();
    return response.status(200).json();
  } catch (error) {
    return response.status(500).json(error);
  }
});

module.exports = router;
