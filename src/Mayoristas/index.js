import dotenv from 'dotenv'
import { prisma } from '../../lib/prisma.js'

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

  if (!nombre || !CUIT || !email || !ciudad || !provincia || !pais) {
    console.log('Faltan datos')
    return {
      error: true,
      message: 'Faltan datos',
      status: 400,
    }
  }

  try {
    const mayorista = await prisma.mayoristas.create({
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

export const getMayoristas = async () => {
  try {
    const mayoristas = await prisma.mayoristas.findMany()

    return {
      error: false,
      message: 'Se han encontrado los siguientes Revendedores',
      status: 200,
      data: mayoristas,
    }
  } catch (error) {
    return {
      error: true,
      message: 'Error al buscar los Revendedores',
      status: 500,
      data: error,
    }
  }
}

export const getOneMayorista = async (id) => {
  try {
    const mayorista = await prisma.mayoristas.findUnique({
      where: {
        id: id,
      },
    })

    return {
      error: false,
      message: 'Se ha encontrado el siguiente Revendedor',
      status: 200,
      data: mayorista,
    }
  } catch (error) {
    return {
      error: true,
      message: 'Error al buscar el Revendedor',
      status: 500,
      data: error,
    }
  }
}

export const updateMayorista = async (id, body) => {
  try {
    const mayorista = await prisma.mayoristas.update({
      where: {
        id: id,
      },
      data: {
        ...body,
      },
    })

    return {
      error: false,
      message: 'Se ha actualizado correctamente el Revendedor',
      status: 200,
      data: mayorista,
    }
  } catch (error) {
    return {
      error: true,
      message: 'Error al actualizar el Revendedor',
      status: 500,
      data: error,
    }
  }
}

export const deleteMayorista = async (id) => {
  try {
    const mayorista = await prisma.mayoristas.delete({
      where: {
        id: id,
      },
    })

    return {
      error: false,
      message: 'Se ha eliminado correctamente el Revendedor',
      status: 200,
      data: mayorista,
    }
  } catch (error) {
    return {
      error: true,
      message: 'Error al eliminar el Revendedor',
      status: 500,
      data: error,
    }
  }
}
