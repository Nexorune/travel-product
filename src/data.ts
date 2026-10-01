import type { Destination, Place, Preferences, Recommendation, Trip } from './types'

export const interests = ['自然风景', '人文历史', '在地美食', '海边散步', '城市漫游', '亲子体验']

export const destinations: Destination[] = [
  {
    id: 'dali', name: '大理', aliases: ['大理市', '云南大理'], province: '云南', eyebrow: '山海之间',
    summary: '苍山、洱海和古城组成舒展的旅行节奏，适合慢慢走、留出发呆时间。',
    accent: '#496454', soft: '#dce6db', budgets: ['适中', '宽松'],
    interests: ['自然风景', '城市漫游', '在地美食'], paces: ['松弛', '均衡'],
    companions: ['一个人', '和朋友', '情侣', '亲子'], days: [3, 5],
    placeIds: ['dali-old-town', 'cangshan', 'longkan', 'xizhou', 'shuanglang', 'shaxi', 'chongsheng'],
  },
  {
    id: 'chengdu', name: '成都', aliases: ['蓉城', '四川成都'], province: '四川', eyebrow: '烟火日常',
    summary: '老街、茶馆与博物馆都在城市生活里，适合边吃边逛，也方便自由调整。',
    accent: '#85523f', soft: '#f0dfd3', budgets: ['经济', '适中', '宽松'],
    interests: ['在地美食', '人文历史', '城市漫游', '亲子体验'], paces: ['松弛', '均衡', '充实'],
    companions: ['一个人', '和朋友', '情侣', '亲子'], days: [3, 5],
    placeIds: ['kuanzhai', 'people-park', 'museum', 'wangping', 'panda', 'dujiangyan', 'taikooli'],
  },
  {
    id: 'xiamen', name: '厦门', aliases: ['鹭岛', '福建厦门'], province: '福建', eyebrow: '海风入城',
    summary: '海岸步道、街巷与岛屿相距不远，三天能轻松展开，也适合亲子同行。',
    accent: '#2f6f73', soft: '#d8eaeb', budgets: ['经济', '适中', '宽松'],
    interests: ['海边散步', '城市漫游', '在地美食', '亲子体验'], paces: ['松弛', '均衡'],
    companions: ['一个人', '和朋友', '情侣', '亲子'], days: [3, 5],
    placeIds: ['shapowei', 'huandao', 'botanical', 'gulangyu', 'market', 'jimei', 'railway'],
  },
]

const place = (id: string, destinationId: string, name: string, category: string, duration: string, reason: string, note: string, coordinate: [number, number]): Place => ({
  id, destinationId, name, category, duration, reason, note, coordinate, source: '演示资料 · 公开地名（位置仅作示意）',
})

export const places: Record<string, Place> = Object.fromEntries([
  place('dali-old-town','dali','大理古城','街区','2.5 小时','适合用一段慢走认识城市纹理。','从南门一带开始，按兴趣停留。',[25.694,100.164]),
  place('cangshan','dali','苍山感通索道周边','自然','半天','提供山地视角，与洱海形成对照。','演示不包含索道开放和票务信息。',[25.650,100.126]),
  place('longkan','dali','龙龛码头','湖岸','1.5 小时','洱海边的轻松停留点，适合放慢节奏。','建议预留弹性时间。',[25.720,100.195]),
  place('xizhou','dali','喜洲古镇','人文','3 小时','可观察传统民居与在地生活。','尊重居民生活空间。',[25.852,100.132]),
  place('shuanglang','dali','双廊','湖岸','3 小时','适合沿湖散步和看远景。','不展示实时路况。',[25.909,100.194]),
  place('shaxi','dali','沙溪古镇','人文','半天','作为五日行程中的慢节奏延伸。','距离与交通方式需另行核实。',[26.319,99.852]),
  place('chongsheng','dali','崇圣寺三塔文化旅游区','人文','2 小时','补充大理历史文化线索。','开放信息以官方为准。',[25.707,100.142]),
  place('kuanzhai','chengdu','宽窄巷子周边','街区','2 小时','从传统街巷进入成都的城市气质。','热门区域可灵活调整时段。',[30.669,104.050]),
  place('people-park','chengdu','人民公园','公园','1.5 小时','茶馆和公园日常适合松弛体验。','不展示实时客流。',[30.657,104.056]),
  place('museum','chengdu','成都博物馆','人文','2.5 小时','用城市史建立后续漫游背景。','预约和开放时间以官方为准。',[30.659,104.065]),
  place('wangping','chengdu','望平街','街区','2 小时','河畔街区适合傍晚散步和觅食。','商户信息不在演示范围内。',[30.659,104.101]),
  place('panda','chengdu','成都大熊猫繁育研究基地','亲子','半天','适合亲子和动物主题兴趣。','预约、交通与开放信息需核验。',[30.739,104.141]),
  place('dujiangyan','chengdu','都江堰景区','自然人文','半天','水利工程兼具自然与历史价值。','跨城交通不在演示计算内。',[31.004,103.619]),
  place('taikooli','chengdu','大慈寺与太古里周边','城市','2 小时','传统建筑与当代城市生活相邻。','按兴趣决定停留长度。',[30.654,104.081]),
  place('shapowei','xiamen','沙坡尾','街区','2 小时','港湾与社区街巷适合轻量漫游。','演示不推荐具体商户。',[24.438,118.088]),
  place('huandao','xiamen','环岛路海岸段','海边','2.5 小时','突出海边散步的目的地特征。','天气和风力需出行前核验。',[24.438,118.147]),
  place('botanical','xiamen','厦门园林植物园','自然','3 小时','城市内自然体验丰富，适合亲子。','开放和预约信息以官方为准。',[24.450,118.112]),
  place('gulangyu','xiamen','鼓浪屿','人文','半天','建筑、步行与海岛体验集中。','船票与客流不在演示范围内。',[24.448,118.063]),
  place('market','xiamen','八市周边','在地','2 小时','从市场观察城市饮食日常。','不展示食品价格或具体店铺。',[24.461,118.082]),
  place('jimei','xiamen','集美学村','人文','半天','补充厦门岛外的人文景观。','交通时间需另行查询。',[24.574,118.097]),
  place('railway','xiamen','铁路文化公园','公园','1.5 小时','轻松连接城市街区的步行段。','按现场开放区域游览。',[24.445,118.100]),
].map((p) => [p.id, p]))

const templates: Record<string, Record<3 | 5, string[][]>> = {
  dali: {3:[['dali-old-town','chongsheng'],['longkan','xizhou'],['cangshan']],5:[['dali-old-town'],['cangshan','chongsheng'],['longkan','xizhou'],['shuanglang'],['shaxi']]},
  chengdu: {3:[['museum','people-park','kuanzhai'],['panda','wangping'],['taikooli']],5:[['museum','people-park'],['panda'],['dujiangyan'],['kuanzhai','wangping'],['taikooli']]},
  xiamen: {3:[['shapowei','railway'],['gulangyu'],['botanical','huandao']],5:[['shapowei','railway'],['gulangyu'],['botanical'],['jimei'],['market','huandao']]},
}

export function createTrip(destinationId: string, days: 3 | 5): Trip {
  const template = templates[destinationId]?.[days] ?? templates[destinationId]?.[3]
  if (!template) throw new Error('当前演示尚未覆盖这个目的地')
  return {
    schemaVersion: 1,
    tripId: `${destinationId}-${days}`,
    destinationId,
    daysCount: days,
    days: template.map((ids, index) => ({day:index + 1, title:index === 0 ? '初见这座城' : index === template.length - 1 ? '留一点余地' : '顺着兴趣走', placeIds:[...ids]})),
    updatedAt: new Date().toISOString(),
  }
}

export function recommend(preferences: Preferences): Recommendation[] {
  return destinations.map((destination) => {
    let score = 0
    const reasons: string[] = []
    const matchedInterests = preferences.interests.filter((item) => destination.interests.includes(item))
    if (matchedInterests.length) { score += matchedInterests.length * 4; reasons.push(`回应你对${matchedInterests.slice(0,2).join('、')}的兴趣`) }
    if (preferences.budget && destination.budgets.includes(preferences.budget)) { score += 3; reasons.push(`与“${preferences.budget}”预算档相容`) }
    if (preferences.pace && destination.paces.includes(preferences.pace)) { score += 3; reasons.push(`适合“${preferences.pace}”节奏`) }
    if (preferences.companion && destination.companions.includes(preferences.companion)) { score += 2; reasons.push(`有适合${preferences.companion}的演示安排`) }
    const caveat = preferences.pace && !destination.paces.includes(preferences.pace) ? `这里的样例更偏${destination.paces.join('或')}节奏` : undefined
    return {destination, reasons: reasons.slice(0,3), caveat, score}
  }).sort((a,b) => b.score - a.score || destinations.indexOf(a.destination) - destinations.indexOf(b.destination))
}

export const destinationById = (id: string) => destinations.find((item) => item.id === id)
