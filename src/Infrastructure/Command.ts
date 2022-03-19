import { isJidGroup, isJidUser, proto, WASocket } from '@adiwajshing/baileys'
import { Command as Commander, CommanderError } from 'commander'
import Auth from './Auth'
import Logger from './Logger'
import Message, { getMessage, getMessageCaption } from './Message'
import {
    CmdType,
    CommandConfiguration,
    CommandHandler,
    CommandPropsHandler
} from './Types/Command'
import { MessageContext } from './Types/Message'
import { isProducation } from './Utils/validate'

export default class Command {
    private message: Message = new Message()
    availableCommands: { [key in CmdType]: CommandConfiguration[] } = {
        'chat-update': [],
        'chat-update-without-trigger': [],
        'list-response-message': []
    }
    /**
     * Registration command handler
     * @param configuration Command configuration
     */
    register(configuration: CommandConfiguration) {
        configuration.events.forEach((event) => {
            configuration.pattern ||= ''
            configuration.fromMe ||= true
            !configuration.whoCanUse?.length &&
                (configuration.whoCanUse = ['me'])

            Logger()
                .child({
                    event,
                    whoCanUse: configuration.whoCanUse,
                    productionOnly: configuration.productionOnly,
                    pattern: configuration.pattern
                })
                .info(`Registering command handler for event: ${event}`)
            this.availableCommands[event].push(configuration)
        })
    }

    private async propsHandlerLayer(
        propsHandler: CommandPropsHandler,
        chat: proto.IWebMessageInfo,
        message: string
    ): Promise<{ props: object; next: boolean }> {
        const program = new Commander()
        program
            .exitOverride()
            .showSuggestionAfterError(false)
            .showHelpAfterError(false)

        const helps: string[] = []
        let isNext = false
        let props = {}
        const next = function (item: object) {
            props = item
            isNext = true
        }

        const addHelp = function (...str: string[]) {
            str.forEach((s) => helps.push(s))
        }
        try {
            await propsHandler({
                chat,
                program,
                message,
                addHelp,
                next
            })

            return {
                props,
                next: isNext
            }
        } catch (error) {
            if (error instanceof CommanderError) {
                const showHelp = () =>
                    this.message.reply(chat, {
                        text: (
                            program.helpInformation() +
                            '\n' +
                            helps.join('\n')
                        ).trim()
                    })
                switch (error.code) {
                    case 'commander.missingArgument':
                        await this.message.reply(chat, {
                            text: error.toString()
                        })
                        await showHelp()
                        break
                    case 'commander.helpDisplayed':
                    case 'commander.help':
                        await showHelp()
                        break

                    default:
                        throw error
                }
            } else {
                throw error
            }
            return {
                next: false,
                props: {}
            }
        }
    }

    bind(socket: WASocket) {
        this.message.bind(socket)

        socket.ev.on('messages.upsert', async (m) => {
            const isFromMe = () => {
                if (m.messages?.length)
                    if (m.messages[0].key.fromMe) return true
                return false
            }

            if (m.type === 'append' || m.type === 'notify') {
                console.log(JSON.stringify(m, undefined, 2))
            }
            const last = m.messages[0]

            const context = this.message.makingContext(last)
            if (!last.message) {
                return
            }
            // Skip apabila yang chat bukan dari user ataupun grup (contohnya broadcast dan story)
            if (
                !(
                    isJidUser(last.key.remoteJid || '') ||
                    isJidGroup(last.key.remoteJid || '')
                )
            ) {
                return
            }

            const message = getMessageCaption(last) || ''

            this.availableCommands['chat-update-without-trigger'].forEach(
                async (cmd) => {
                    if (isFromMe()) if (!cmd.fromMe) return
                    /**
                     * Auhtorization who can use
                     */
                    if (
                        !(await Auth.authorization(
                            socket,
                            cmd.whoCanUse!,
                            last
                        ))
                    )
                        return
                    /**
                     * if productionOnly is true then check if is production
                     */
                    if (cmd.productionOnly && !isProducation()) {
                        return
                    }
                    let { propsHandler } = cmd
                    let futureProps = {}
                    if (propsHandler) {
                        let { next, props } = await this.propsHandlerLayer(
                            propsHandler,
                            last,
                            message
                        )
                        if (!next) return
                        futureProps = props
                    }
                    Object.assign(context, {
                        chat: last,
                        message,
                        props: futureProps
                    })
                    cmd.handler(context as CommandHandler)
                }
            )

            // Chat update event handler
            this.availableCommands['chat-update'].forEach(async (cmd) => {
                if (isFromMe()) if (!cmd.fromMe) return
                const { pattern, handler, propsHandler } = cmd

                /**
                 * Auhtorization who can use
                 */
                if (!(await Auth.authorization(socket, cmd.whoCanUse!, last)))
                    return
                /**
                 * if productionOnly is true then check if is production
                 */
                if (cmd.productionOnly && !isProducation()) {
                    return
                }

                let handlerResult: Partial<CommandHandler> = {
                    chat: last,
                    message,
                    props: {}
                }

                switch (typeof pattern) {
                    case 'string':
                        if (message == pattern) {
                            if (propsHandler) {
                                let { next, props } =
                                    await this.propsHandlerLayer(
                                        propsHandler,
                                        last,
                                        message
                                    )
                                if (!next) return
                                handlerResult.props = props
                            }

                            Object.assign(context, handlerResult)
                            handler(context as CommandHandler)
                        }
                        break
                    case 'object':
                        if (pattern instanceof RegExp) {
                            let matched = message.match(pattern)
                            if (matched) {
                                if (propsHandler) {
                                    let { next, props } =
                                        await this.propsHandlerLayer(
                                            propsHandler,
                                            last,
                                            message
                                        )
                                    if (!next) return
                                    handlerResult.props = props
                                }
                                Object.assign(context, handlerResult)
                                handler(
                                    context as CommandHandler & MessageContext
                                )
                            }
                        }

                        break
                }
            })

            // Chat update list response message event handler
            this.availableCommands['list-response-message'].forEach(
                async (cmd) => {
                    if (isFromMe()) if (!cmd.fromMe) return
                    const { pattern, handler, propsHandler } = cmd

                    /**
                     * Auhtorization who can use
                     */
                    if (
                        !(await Auth.authorization(
                            socket,
                            cmd.whoCanUse!,
                            last
                        ))
                    )
                        return
                    /**
                     * if productionOnly is true then check if is production
                     */
                    if (cmd.productionOnly && !isProducation()) {
                        return
                    }
                    let matched: RegExpMatchArray | null | string = null
                    let response = getMessage(last)?.listResponseMessage
                    let bodyListMessage =
                        response?.singleSelectReply?.selectedRowId || ''

                    let handlerResult: Partial<CommandHandler> = {
                        chat: last,
                        message: bodyListMessage,
                        props: {}
                    }
                    switch (typeof pattern) {
                        case 'string':
                            if (bodyListMessage == pattern) matched = pattern
                            break
                        case 'object':
                            matched = bodyListMessage.match(pattern)
                            break
                    }

                    if (matched) {
                        if (propsHandler) {
                            let { next, props } = await this.propsHandlerLayer(
                                propsHandler,
                                last,
                                bodyListMessage
                            )
                            if (!next) return
                            handlerResult.props = props
                        }
                        Object.assign(context, handlerResult)
                        handler(context as CommandHandler)
                    }
                }
            )
        })
    }
}
