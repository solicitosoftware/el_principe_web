const { Router } = require("express");
const router = Router();
const { firebase, auth } = require("../firebase/firebase");

router.post("/api/createUsuario", async (request, response) => {
  try {
    const result = await auth.createUser(request.body);
    return response.status(200).json(result);
  } catch (error) {
    return response.status(500).json(error);
  }
});

router.put("/api/getUsuario/:usuario_id", async (request, response) => {
  try {
    const values = await firebase
      .collection("empleados")
      .doc(request.params.usuario_id)
      .get();
    const usuario = values.exists && values.data();
    return response.status(200).json(usuario);
  } catch (error) {
    return response.status(500).json(error);
  }
});

module.exports = router;
