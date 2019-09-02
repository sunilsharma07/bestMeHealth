// import DiskAdapter from 'sails-disk'
import Waterline from 'waterline'
import sailsMongo from 'sails-mongo'

import userCollection from './models/users'
import mediaCollection from './models/media'
import planCollection from './models/plan'
import feedbackCollection from './models/feedback'
import blogCollection from './models/blog'
import favouriteBlogCollection from './models/favouriteBlog'
import categoryCollection from './models/category'
import cookingVideoCollection from './models/cookingVideo'
import addressVideoCollection from './models/address'
import testCollection from './models/test'
import tipsCollection from './models/tips'
import systemUserCollection from './models/systemUsers'
import testFit132Collection from './models/testFit132'
import testMicronutrientCollection from './models/testMicronutrient'
import userActivitytCollection from './models/userActivity'
import ingredientsCollection from './models/ingredients'
import exerciseCategoryCollection from './models/exerciseCategory'
import muscleCollection from './models/muscle'
import equipmentCollection from './models/equipment'
import exerciseCollection from './models/exercise'
import permissionCollection from './models/permission'
import appointmentCollection from './models/appointment'
import tempReportCollection from './models/tempReport'
import testReportCollection from './models/testReport'
import micronutrientsReportCategoryCollection from './models/micronutrientsReportCategory'
import micronutrientsReportCategoryContentCollection from './models/micronutrientsReportCategoryContent'
import recipeCollection from '../db/models/recipe'

// Instantiate a new instance of the ORM
let orm = new Waterline()
let DB = {}

// Build A Config Object
let config = {

  // Setup Adapters
  adapters: {
    'sails-mongo': sailsMongo,
  },

  defaults: {
    migrate: 'alter'
  },

  // Build Connections Config
  // Setup connections using the named adapter configs
  datastores: {
    databaseConn: {
      adapter: 'sails-mongo',
      url: 'mongodb://192.168.2.209:27017/bestMeHealthStaging'
    }
  }
}

// Load the Models into the ORM
orm.registerModel(userCollection)
orm.registerModel(mediaCollection)
orm.registerModel(planCollection)
orm.registerModel(feedbackCollection)
orm.registerModel(blogCollection)
orm.registerModel(favouriteBlogCollection)
orm.registerModel(categoryCollection)
orm.registerModel(cookingVideoCollection)
orm.registerModel(addressVideoCollection)
orm.registerModel(testCollection)
orm.registerModel(testFit132Collection)
orm.registerModel(testMicronutrientCollection)
orm.registerModel(tipsCollection)
orm.registerModel(systemUserCollection)
orm.registerModel(userActivitytCollection)
orm.registerModel(ingredientsCollection)
orm.registerModel(exerciseCategoryCollection)
orm.registerModel(muscleCollection)
orm.registerModel(equipmentCollection)
orm.registerModel(exerciseCollection)
orm.registerModel(permissionCollection)
orm.registerModel(appointmentCollection)
orm.registerModel(tempReportCollection)
orm.registerModel(testReportCollection)
orm.registerModel(micronutrientsReportCategoryCollection)
orm.registerModel(micronutrientsReportCategoryContentCollection)
orm.registerModel(recipeCollection)

DB.initialize = () => {
  return new Promise((resolve, reject) => {
    orm.initialize(config, (err, models) => {
      if (err) {
        return reject(err)
      }

      DB.User = models.collections.tbl_customer
      DB.Media = models.collections.tbl_media
      DB.Plan = models.collections.tbl_plan
      DB.Feedback = models.collections.tbl_feedback
      DB.Blog = models.collections.tbl_blog
      DB.FavouriteBlog = models.collections.tbl_favouriteblog
      DB.Category = models.collections.tbl_category
      DB.CookingVideo = models.collections.tbl_cookingvideo
      DB.Address = models.collections.tbl_address
      DB.Test = models.collections.tbl_test
      DB.TestFit132 = models.collections.tbl_testfit132
      DB.Tips = models.collections.tbl_tips
      DB.SystemUser = models.collections.tbl_users
      DB.UserActivity = models.collections.tbl_useractivity
      DB.Ingredients = models.collections.tbl_ingredients
      DB.ExerciseCategory = models.collections.tbl_category_exercise
      DB.Muscle = models.collections.tbl_muscle
      DB.Equipment = models.collections.tbl_equipment
      DB.Exercise = models.collections.tbl_exercise
      DB.Permission = models.collections.tbl_permission
      DB.Appointment = models.collections.tbl_appointment
      DB.TempReport = models.collections.tbl_temp_report
      DB.TestReport = models.collections.tbl_test_report
      DB.MicronutrientsReportCategory = models.collections.tbl_micronutrients_report_category
      DB.MicronutrientsReportCategoryContent = models.collections.tbl_micronutrients_report_category_content
      DB.Recipe = models.collections.tbl_recipe

      // DB.User.find({}).then(users => {
      //   console.log('users', users)
      // })

      // First we create a user
      // DB.User.create({
      //   email: 'vp@gmail.com',
      //   first_name: 'Vis',
      //   last_name: 'Pra'
      // }).meta({
      //   fetch: true
      // }).then(user => {
      //   console.log('\nuser ->', user)

      //   DB.ChatUser.create({
      //     user: user.id
      //   }).meta({
      //     fetch: true
      //   }).then(chatUser => {
      //     console.log('\nchatUser ->', chatUser)
      //   })
      // })

      // DB.ChatUser.find({}).populate('user', {  }).then(chatUsers => {
      //   console.log('\nchatUsers', chatUsers)
      // })
      resolve()
    })
  })
}

export default DB