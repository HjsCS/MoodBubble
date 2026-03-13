const db = require("../firebase");

exports.createEntry = async (req, res) => {

  try{

    const entry = {
      userId: req.body.userId,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      emotionScore: req.body.emotionScore,
      category: req.body.category,
      note: req.body.note,
      mediaUrl: req.body.mediaUrl,
      visibility: req.body.visibility,
      timestamp: Date.now()
    }

    await db.collection("moodEntries").add(entry)

    res.status(200).json({message:"Entry created"})

  } catch(err){

    res.status(500).json(err)

  }

}