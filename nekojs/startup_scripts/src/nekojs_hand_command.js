import { $LiteralArgumentBuilder } from 'java:com/mojang/brigadier/builder/LiteralArgumentBuilder'
import { $Component } from 'java:net/minecraft/network/chat/Component'

CommandEvents.register(event => {
  const dispatcher = event.getDispatcher()
  const sendCopyableMessage = (source, label, clipboardText) => {
    const message = $Component.literal(label)
      .clickCopy(clipboardText)
      .hoverText($Component.literal('Click to copy the full item details'))
    source.sendSystemMessage(message)
  }

  const createHandCommand = () => $LiteralArgumentBuilder.literal('hand').executes(context => {
    const source = context.getSource()
    let stage = 'getting player'
    try {
      const player = source.getPlayerOrException()
      stage = 'reading main-hand item'
      const stack = player.getMainHandItem()

      if (stack.isEmpty()) {
        source.sendSystemMessage($Component.literal('Empty hand'))
        return 1
      }

      stage = 'reading item registry ID'
      const itemId = stack.getItem()
        .builtInRegistryHolder()
        .key()
        .identifier()
        .toString()

      const details = [
        `id: ${itemId}`,
        `count: ${stack.getCount()}`
      ]
      if (stack.isDamageableItem()) {
        details.push(`damage: ${stack.getDamageValue()}/${stack.getMaxDamage()}`)
      }

      stage = 'reading item components'
      details.push(`components: ${stack.getComponentsPatch().toString()}`)
      const clipboardText = details.join('\n')
      sendCopyableMessage(source, `${itemId} x${stack.getCount()} [copy]`, clipboardText)
      for (const detail of details.slice(1)) {
        sendCopyableMessage(source, detail, clipboardText)
      }
      return 1
    } catch (error) {
      const message = `[NekoJS] hand command failed while ${stage}: ${String(error)}`
      console.error(message)
      source.sendSystemMessage($Component.literal(message))
      return 0
    }
  })

  dispatcher.register(
    $LiteralArgumentBuilder.literal('nekojs').then(createHandCommand())
  )
  console.info('[NekoJS] Registered /nekojs hand')
})
