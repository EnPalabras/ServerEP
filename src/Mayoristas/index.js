import dotenv from 'dotenv'
import { prisma } from '../../../lib/prisma.js'

dotenv.config()

export const createMayorista = async (body) => {
  const {
    nombre,
    CUIT,
    email,
    telefono,
    ciudad,
    provincia,
    pais,
    codigoPostal,
    instagramLink,
    webLink,
    comentarios,
  } = body

  if (
    !nombre ||
    !CUIT ||
    !email ||
    !telefono ||
    !ciudad ||
    !provincia ||
    !pais ||
    !codigoPostal
  ) {
    return {
      error: true,
      message: 'Faltan datos',
      status: 400,
    }
  }

  try {
    const mayorista = await prisma.mayorista.create({
      data: {
        id: CUIT,
        nombre,
        CUIT,
        email,
        telefono,
        ciudad,
        provincia,
        pais,
        codigoPostal,
        instagramLink,
        webLink,
        comentarios,
      },
    })

    return {
      error: false,
      message: 'Se ha cargado correctamente el Revendedor',
      status: 200,
      data: mayorista,
    }
  } catch (error) {
    return {
      error: true,
      message: 'Error al cargar el Revendedor',
      status: 500,
      data: error,
    }
  }
}
