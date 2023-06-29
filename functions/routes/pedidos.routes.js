const { Router } = require("express");
const router = Router();
const { firebase, time, timestamp } = require("../firebase/firebase");

router.post("/api/getPedidos", async (request, response) => {
  try {
    const values = await firebase
      .collection("pedidos")
      .where("fecha", ">=", timestamp(new Date(request.body.startOfToday)))
      .where("fecha", "<=", timestamp(new Date(request.body.endOfToday)))
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

router.post("/api/createPedido", async (request, response) => {
  try {
    const result = await firebase
      .collection("pedidos")
      .add({ ...request.body.data, fecha: time });
    return response.status(200).json(result);
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.put("/api/updatePedido/:pedido_id", async (request, response) => {
  try {
    const result = await firebase
      .collection("pedidos")
      .doc(request.params.pedido_id)
      .update({
        modificado: true,
        usuario: request.body.usuario,
        recibido: request.body.recibido,
        total: request.body.total,
        ipoconsumo: request.body.ipoconsumo,
        observaciones: request.body.observaciones,
        medioPago: request.body.medioPago,
        productos: request.body.productos,
        movimiento: time,
      });
    return response.status(200).json(result);
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.put("/api/updateDomiciliario/:pedido_id", async (request, response) => {
  try {
    const result = await firebase
      .collection("pedidos")
      .doc(request.params.pedido_id)
      .update({
        domiciliario: request.body.domiciliario
          ? { ...request.body.domiciliario, hora: time }
          : null,
      });
    return response.status(200).json(result);
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.put("/api/getPedidoDomicilio/:pedido_id", async (request, response) => {
  try {
    const pedido = await firebase
      .collection("pedidos")
      .doc(request.params.pedido_id)
      .get();
    return response.status(200).json(pedido.data());
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.put(
  "/api/updatePedidoDomicilio/:pedido_id",
  async (request, response) => {
    try {
      const result = await firebase
        .collection("pedidos")
        .doc(request.params.pedido_id)
        .update({
          modificado: true,
          usuario: request.body.usuario,
          estado: request.body.estado,
          total: request.body.total,
          ipoconsumo: request.body.ipoconsumo,
          observaciones: request.body.observaciones,
          medioPago: request.body.medioPago,
          productos: request.body.productos,
          movimiento: request.body.movimiento ? time : request.body.movimiento,
          cliente: request.body.cliente,
          recibido: request.body.recibido,
          detallePago: request.body.detallePago,
        });
      return response.status(200).json(result);
    } catch (error) {
      return response.status(500).json(error);
    }
  }
);

router.put("/api/updateEstadoPedido/:pedido_id", async (request, response) => {
  try {
    const result = await firebase
      .collection("pedidos")
      .doc(request.params.pedido_id)
      .update({
        estado: request.body.estado,
        deuda: request.body.deuda || null,
        espera: request.body.espera || null,
        movimiento: time,
      });
    return response.status(200).json(result);
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.put("/api/updateEntregaPedido/:pedido_id", async (request, response) => {
  try {
    const result = await firebase
      .collection("pedidos")
      .doc(request.params.pedido_id)
      .update({
        estado: request.body.estado,
        entrega: time,
      });
    return response.status(200).json(result);
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.post("/api/deletePedidos", async (request, response) => {
  try {
    const batch = firebase.batch();
    request.body.data.map((docId) => {
      const documentRef = firebase.collection("pedidos").doc(docId);
      batch.delete(documentRef);
    });
    const result = await batch.commit();
    return response.status(200).json(result);
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.put("/api/cancelPedido/:pedido_id", async (request, response) => {
  try {
    const result = await firebase
      .collection("pedidos")
      .doc(request.params.pedido_id)
      .update({
        comentario: request.body.comentario,
        estado: request.body.estado,
        total: request.body.total,
        deuda: request.body.deuda || null,
        ipoconsumo: request.body.ipoconsumo,
        movimiento: time,
      });
    return response.status(200).json(result);
  } catch (error) {
    return response.status(500).json(error);
  }
});

module.exports = router;
