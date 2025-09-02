const express = require('express')
const morgan = require('morgan')

const app = express()

const { StatusCodes } = require('http-status-codes')

app.use(express.json())

app.use(morgan('tiny'))

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
]

//configuration du midleware morgan pour pouvoir renvoyer les donnes du body dan sla console

morgan.token('postToken', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return '-'
})

//utilisation du token dans le format morgan

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :postToken'
  )
)

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find((person) => person.id === id)

  if (person) return response.json(person)

  response.status(StatusCodes.NOT_FOUND).end()
})

app.get('/info', (request, response) => {
  const time = new Date()
  const nbrePeople = persons.length
  const result = `<p>PhoneBook has info for ${nbrePeople} people</p>
   <p>${time}</p>`

  response.send(result)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.filter((person) => person.id !== id)
  if (person) return response.json(person)
  response.status(StatusCodes.NO_CONTENT).end()
})

const generateID = (persons, min = 1, max = 1000000) => {
  const existsId = new Set(persons.map((pers) => pers.id))
  let id

  do {
    id = Math.floor(Math.random() * (max - min + 1)) + min
  } while (existsId.has(id))

  return id
}

app.post('/api/persons', (request, response) => {
  console.log('hello')
  const body = request.body

  const exitsName = persons.some((person) => person.name === body.name)
  //verifier si le numero exits deja

  if (!body.name || !body.number)
    return response.status(400).json({ error: 'name or number missing' })

  //verifier si un non exists deja

  if (exitsName)
    return response
      .status(400)
      .json({ error: `${body.name} already exists in the phonebook` })

  const newPerson = {
    name: body.name,
    number: body.number,
    id: generateID(persons),
  }

  persons = persons.concat(newPerson)
  response.status(201).json(newPerson)
})

//midleware pour gerer les routes inexistantes

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`server runing on port ${PORT}`)
})
