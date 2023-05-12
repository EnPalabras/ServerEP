export const setDateTN = (date) => {
  if (date === null || date === undefined) {
    return null
  }

  const datetime = new Date(
    new Date(date).toLocaleString('sv-SE', {
      timeZone: 'America/Argentina/Buenos_Aires',
    })
  )

  datetime.setHours(datetime.getHours())

  return datetime
}

export const setDateML = (date) => {
  if (date === null || date === undefined) {
    console.log('null')
    return null
  }
  const datetime = new Date(
    new Date(date).toLocaleString('sv-SE', {
      timeZone: 'America/Argentina/Buenos_Aires',
    })
  )

  datetime.setHours(datetime.getHours())
  console.log(datetime)
  return datetime
}
