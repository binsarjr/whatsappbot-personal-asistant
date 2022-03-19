// import WAPI from '../../Infrastructure/WAPI'

// if (WAPI.isProducation()) {
//     WAPI.onWs<(json: any) => any>('CB:Call', async (json: any) => {
//         let number = json[1]['from']
//         let isOffer = json[1]['type'] == 'offer'

//         if (number && isOffer && json[1]['data']) {
//             let data = json[1]['data'][0]
//             let groupInfo: boolean = false
//             try {
//                 groupInfo =
//                     (data[2][data[2]?.length - 1][0] || '') == 'group_info'
//             } catch (error) {
//                 groupInfo = false
//             }
//             var tag = WAPI.socket!.generateMessageTag()
//             var jsjs = [
//                 'action',
//                 'call',
//                 [
//                     'call',
//                     {
//                         from: WAPI.jid,
//                         to: number.split('@')[0] + '@s.whatsapp.net',
//                         id: tag
//                     },
//                     [
//                         [
//                             'reject',
//                             {
//                                 'call-id': data[1]['call-id'],
//                                 'call-creator': data[1]['call-creator'],
//                                 count: '0'
//                             },
//                             null
//                         ]
//                     ]
//                 ]
//             ]
//             WAPI.socket!.query({
//                 json: jsjs,
//                 tag
//             })
//             if (data[1]['group-jid'] || groupInfo) {
//                 await Asistant().message.sendMessage(
//                     data[1]['group-jid'] || data[1]['call-creator'],
//                     {
//                         text: 'Maaf saya tidak bisa mengikuti panggilan Anda.',
//                         mentions: [data[1]['call-creator']]
//                     }
//                 )
//             } else {
//                 await Asistant().message.sendMessage(number, {
//                     text: 'Nomer anda kami blokir karna melanggar s&k yang telah kami berikan.'
//                 })
//                 await WAPI.socket!.blockUser(number, 'add')
//             }
//         }
//     })
// }
