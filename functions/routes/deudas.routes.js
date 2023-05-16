const { Router } = require("express");
const router = Router();
const { firebase } = require("../firebase/firebase");

router.get("/api/getDeudas", async (request, response) => {
  try {
    const values = await firebase
      .collection("pedidos")
      .where("deuda", "==", true)
      .where("medioPago", "in", ["efectivo", "parcial"])
      .where("estado", "!=", "Cancelado")
      .get();
    const pedidos = values.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    return response.status(200).json(pedidos);
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.put("/api/updateDeuda/:pedido_id", async (request, response) => {
  try {
    const document = firebase
      .collection("pedidos")
      .doc(request.params.pedido_id);
    await document.update({
      deuda: false,
    });
    return response.status(200).json();
  } catch (error) {
    return response.status(500).json(error);
  }
});

module.exports = router;
