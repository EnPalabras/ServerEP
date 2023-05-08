const setDateML = (date) => {
  const datetime = new Date(
    new Date(date).toLocaleString('sv-SE', {
      timeZone: 'America/Argentina/Buenos_Aires',
    })
  )

  datetime.setHours(datetime.getHours() - 3)
  return datetime
}

setDateML('2023-05-04T14:50:31.000-04:00')
