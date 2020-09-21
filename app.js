'use strict'

const { mapUser, mapArticle, getRandomFirstName } = require('./util')
const students = require('./students.json')

// db connection and settings
const connection = require('./config/connection')
let userCollection;
let articlesCollection;
let studentsCollection;
run();

async function run() {
  await connection.connect()
  await connection.get().dropCollection('users')
  await connection.get().dropCollection('articles')
  await connection.get().dropCollection('students')
  userCollection = connection.get().collection('users')
  articlesCollection = connection.get().collection('articles')
  studentsCollection = connection.get().collection('students')
  await user1()
  await user2()
  await user3()
  await user4()
  await articles1()
  await articles2()
  await articles3()
  await articles4()
  await articles5()
  await importStudents()
  await students1()
  await students2()
  await students3()
  await students4()
  await students5()
  await students6()
  await students7()
  await connection.close()
}

// #### Users

//- Create 2 users per department (a, b, c)


async function user1() {
  const departments = ['a', 'a', 'b', 'b', 'c', 'c']
  const users = departments.map(d => ({ department: d })).map(mapUser)
  try {
    const { result } = await userCollection.insertMany(users)
    console.log(`Added ${result.n} users`)
  } catch (err) {
    console.error(err)
  }
}

// - Delete 1 user from department (a)

async function user2() {
  try {
    const { result } = await userCollection.deleteOne({ department: 'a' })
    console.log(`Removed ${result.n} user`)
  } catch (err) {
    console.error(err)
  }
}

// - Update firstName for users from department (b)

async function user3() {
  try {
    const usersB = await userCollection.find({ department: "b" }).toArray();
    const bulkWrite = usersB.map(user => ({
      updateOne: {
        filter: { _id: user._id },
        update: { $set: { firstName: getRandomFirstName() } }
      }
    }))

    const { result } = await userCollection.bulkWrite(bulkWrite)
    console.log(`Updated ${result.n} user`)

  } catch (err) {
    console.error(err)
  }
}

//- Find all users from department (c)
async function user4() {
  try {

    const usersC = await userCollection.find({ department: "c" }).toArray();
    console.log(usersC)

  } catch (err) {
    console.error(err)
  }
}


// Articles

/*
  {
      name:  'Mongodb - introduction',
      description: 'Mongodb - text',
      type: 'a',
      tags: []
  }
*/


// - Create 5 articles per each type (a, b, c)
async function articles1() {

  const types = ['a', 'a', 'a', 'a', 'a', 'b', 'b', 'b', 'b', 'b', 'c', 'c', 'c', 'c', 'c']
  const articles = types.map(t => ({ type: t })).map(mapArticle)

  try {

    const { result } = await articlesCollection.insertMany(articles)
    console.log(`Added ${result.n} articles`)

  } catch (err) {
    console.error(err)
  }
}



// - Find articles with type a, and update tag list with next value [‘tag1-a’, ‘tag2-a’, ‘tag3’]
async function articles2() {
  try {
    const [query, update] = [
      { type: "a" },
      {
        $push: {
          tags: { $each: ['tag1-a', 'tag2-a', 'tag3'] }
        }
      }
    ]

    const { result } = await articlesCollection.updateMany(query, update)

    console.log(`Updated ${result.n} articles`)
  } catch (err) {
    console.error(err)
  }
}



// - Add tags [‘tag2’, ‘tag3’, ‘super’] to other articles except articles from type a
async function articles3() {
  try {
    const [query, update] = [
      { type: { $ne: 'a' } },
      {
        $push: {
          tags: { $each: ['tag2', 'tag3', 'super'] }
        }
      }
    ]

    const { result } = await articlesCollection.updateMany(query, update)

    console.log(`Updated ${result.n} articles`)
  } catch (err) {
    console.error(err)
  }
}
// - Find all articles that contains tags [tag2, tag1-a]
async function articles4() {
  try {
    const query = { tags: { $in: ['tag2', 'tag1-a'] } }

    const result = await articlesCollection.find(query).toArray();
    console.log(result)

  } catch (err) {
    console.error(err)
  }
}

// - Pull [tag2, tag1-a] from all articles

async function articles5() {
  try {

    const update = {
      $pull: {
        tags: { $in: ['tag2', 'tag1-a'] }
      }
    }

    const { result } = await articlesCollection.updateMany({}, update);

    console.log(`Removad ${result.n} tags`)
  } catch (err) {
    console.error(err)
  }
}

// Students Data

// - Import all data from students.json into student collection
async function importStudents() {
  try {
    const { result } = await studentsCollection.insertMany(students);

    console.log(`Added ${result.n} students`)
  } catch (err) {
    console.error(err)
  }
}

// Students Statistic

// - Find all students who have the worst score for homework, sort by descent
async function students1() {
  try {
    const result = await studentsCollection.aggregate([
      { $unwind: "$scores" },
      { $match: { "scores.type": "homework" } },
      { $sort: { "scores.score": 1 } },
      { $limit: 10 }
    ]).toArray()

    console.log(result)
  } catch (err) {
    console.error(err)
  }
}
// - Find all students who have the best score for quiz and the worst for homework, sort by ascending
async function students2() {
  try {

  } catch (err) {
    console.error(err)
  }
}
// - Find all students who have best scope for quiz and exam
async function students3() {
  try {

  } catch (err) {
    console.error(err)
  }
}
// - Calculate the average score for homework for all students
async function students4() {
  try {
    const result = await studentsCollection.aggregate([
      { $unwind: "$scores" },
      { $match: { "scores.type": "homework" } },
      { $avg: "$scores.score" }
    ])

    console.log(result)
  } catch (err) {
    console.error(err)
  }
}
// - Delete all students that have homework score <= 60
async function students5() {
  try {
    const query = {
      scores: {
        $elemMatch: {
          type: "homework", score: { $lte: 60 }
        }
      }
    }

    const { result } = await studentsCollection.deleteMany(query)
    console.log(`Removed ${result.n} user`)

  } catch (err) {
    console.error(err)
  }
}
// - Mark students that have quiz score => 80
async function students6() {
  try {
    const [query, update] = [
      {
        scores: {
          $elemMatch: {
            type: "quiz", score: { $gte: 80 }
          }
        }
      },
      { $set: { mark: 'A' } }
    ]
    const { result } = await studentsCollection.updateMany(query, update)
    console.log(`Marked ${result.n} users`)

  } catch (err) {
    console.error(err)
  }
}
// - Write a query that group students by 3 categories (calculate the average grade for three subjects)
//   - a => (between 0 and 40)
//   - b => (between 40 and 60)
//   - c => (between 60 and 100)
async function students7() {
  try {

  } catch (err) {
    console.error(err)
  }
}