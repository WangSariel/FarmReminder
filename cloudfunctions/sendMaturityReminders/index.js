const cloud = require("wx-server-sdk");
const farm = require("./farm");

cloud.init({
  env: "cloud1-please-replace"
});

const db = cloud.database();
const _ = db.command;

async function getSettings(openid) {
  const result = await db.collection("settings").where(
    _.or([
      { openid },
      { _openid: openid }
    ])
  ).limit(1).get();
  return result.data[0] || farm.DEFAULT_SETTINGS;
}

function buildTemplateData(fields, task) {
  const data = {};
  data[fields.cropName] = { value: task.name };
  data[fields.reminderType] = { value: task.typeText };
  data[fields.finishTime] = { value: farm.formatDateTime(task.finishAt) };
  data[fields.note] = { value: task.note };
  return data;
}

async function sendTaskReminder(task) {
  const settings = await getSettings(task.openid);
  if (!settings.templateId) {
    return { id: task._id, type: task.type, skipped: "missing-template" };
  }

  await cloud.openapi.subscribeMessage.send({
    touser: task.openid,
    templateId: settings.templateId,
    page: "pages/home/home",
    data: buildTemplateData(settings.templateFields || farm.DEFAULT_SETTINGS.templateFields, task)
  });

  await db.collection(task.collection).doc(task._id).update({
    data: {
      reminded: true,
      remindedAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
  });
  return { id: task._id, type: task.type, sent: true };
}

exports.main = async () => {
  const now = new Date().toISOString();
  const plantingResult = await db.collection("plantings")
    .where({
      remind: true,
      reminded: _.neq(true),
      matureAt: _.lte(now)
    })
    .limit(100)
    .get();

  const processingResult = await db.collection("processings")
    .where({
      remind: true,
      reminded: _.neq(true),
      finishAt: _.lte(now)
    })
    .limit(100)
    .get();

  const tasks = plantingResult.data.map((planting) => ({
    ...planting,
    collection: "plantings",
    type: "planting",
    typeText: "成熟提醒",
    name: planting.cropName || "作物",
    finishAt: planting.matureAt,
    note: "作物已经成熟，记得收获。"
  })).concat(processingResult.data.map((processing) => ({
    ...processing,
    collection: "processings",
    type: "processing",
    typeText: "加工完成",
    name: processing.itemName || "加工物",
    finishAt: processing.finishAt,
    note: "加工物已经完成，记得领取。"
  })));

  const reports = [];
  for (const task of tasks) {
    try {
      reports.push(await sendTaskReminder(task));
    } catch (error) {
      reports.push({ id: task._id, type: task.type, error: error.message });
    }
  }

  return { checked: tasks.length, reports };
};
