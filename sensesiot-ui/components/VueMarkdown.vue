<script>
import { marked } from 'marked'

marked.use({
  extensions: [
    {
      name: 'fontawesome_icon',
      level: 'inline',
      start(src) {
        return src.match(/::(?:(far|fas|fab)\s?)?[^:\n]+::/)?.index
      },
      tokenizer(src, tokens) {
        const rule = /^::(?:(far|fas|fab)\s?)?([^:\n]+)::/
        const match = rule.exec(src)
        if (match) {
          const token = {
            type: 'fontawesome_icon',
            raw: match[0],
            icons: [match[1].trim(), match[2].trim()],
          }
          return token
        }
      },
      renderer(token) {
        const iconClasses = token.icons.join(' ')
        return `<i class='${iconClasses} fa-fw'></i>`
      },
    },
  ],
})

export default {
  name: 'VMarkdown',
  props: {
    source: {
      type: String,
      required: true,
    },
    inline: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    renderNodes(h, tokens) {
      if (Array.isArray(tokens)) {
        return tokens.reduce((prev, token) => {
          const node = this.renderNode(h, token)

          if (Array.isArray(node)) {
            return prev.concat(node)
          } else {
            prev.push(node)
          }
          return prev
        }, [])
      }
      return []
    },
    renderNode(h, token) {
      switch (token.type) {
        case 'space':
          return ''
        case 'heading':
          return this.renderHeadingNode(h, token)
        case 'code':
          return this.renderCodeNode(h, token)
        case 'blockquote':
          return this.renderBlockquoteNode(h, token)
        case 'paragraph':
          return this.renderParagraphNode(h, token)
        case 'list':
          return this.renderListNode(h, token)
        case 'list_item':
          return this.renderListItemNode(h, token)
        case 'table':
          return this.renderTableNode(h, token)
        case 'image':
          return this.renderImageNode(h, token)
        case 'em':
          return this.renderEmNode(h, token)
        case 'strong':
          return this.renderStrongNode(h, token)
        case 'del':
          return this.renderDelNode(h, token)
        case 'codespan':
          return this.renderCodespanNode(h, token)
        case 'link':
          return this.renderLinkNode(h, token)
        case 'hr':
          return this.renderHrNode(h, token)
        case 'br':
          return this.renderBrNode(h, token)
        case 'escape':
          return this.renderTextNode(h, token)
        case 'text':
          return this.renderTextNode(h, token)
        case 'fontawesome_icon':
          return this.renderFontawesomeNode(h, token)
        default:
          return this.renderTextNode(h, token)
      }
    },
    renderHeadingNode(h, token) {
      return this.inline
        ? this.renderTextNode(h, token)
        : h(`h${token.depth}`, {}, this.renderNodes(h, token.tokens))
    },
    renderCodeNode(h, token) {
      return this.inline
        ? this.renderCodespanNode(h, this.renderNodes(h, token.tokens))
        : h(
            'pre',
            { class: 'pre-scrollable p-2 bg-light border border-secondary' },
            [h('code', {}, [token.text])]
          )
    },
    renderBlockquoteNode(h, token) {
      return this.inline
        ? this.renderTextNode(h, token)
        : h(
            'blockquote',
            { class: ['blockquote'] },
            this.renderNodes(h, token.tokens)
          )
    },
    renderParagraphNode(h, token) {
      return this.inline
        ? this.renderTextNode(h, token)
        : h(token.pre ? 'pre' : 'p', {}, this.renderNodes(h, token.tokens))
    },
    renderListNode(h, token) {
      if (this.inline) {
        return this.renderTextNode(h, token)
      }

      if (token.ordered) {
        return h(
          'ol',
          { attrs: { start: token.start } },
          this.renderNodes(h, token.items)
        )
      }

      return h('ul', {}, this.renderNodes(h, token.items))
    },
    renderListItemNode(h, token) {
      if (token.task) {
        return h(
          'li',
          {
            class: 'list-unstyled',
            style: {
              marginLeft: '-1.5em',
            },
          },
          [
            h('font-awesome-icon', {
              style: {
                marginRight: '0.25em',
              },
              props: {
                icon: token.checked
                  ? ['far', 'fa-square-check']
                  : ['far', 'fa-square'],
                fixedWidth: true,
              },
            }),
            ...this.renderNodes(h, token.tokens),
          ]
        )
      }
      return h('li', {}, this.renderNodes(h, token.tokens))
    },
    renderTableNode(h, token) {
      if (this.inline) {
        return this.renderTextNode(h, token)
      }

      const headerNode = token.header.map((cellToken, i) =>
        this.renderTableCellNode(h, cellToken, {
          align: token.align[i],
          header: true,
        })
      )
      const bodyNodes = token.rows.map((row) => {
        return h(
          'b-tr',
          {},
          row.map((cellToken, i) =>
            this.renderTableCellNode(h, cellToken, {
              align: token.align[i],
            })
          )
        )
      })

      return h(
        'b-table-simple',
        {
          props: {
            bordered: true,
            hover: true,
          },
        },
        [
          h(
            'b-thead',
            {
              props: {
                headVariant: 'light',
              },
            },
            [h('b-tr', {}, headerNode)]
          ),
          h('b-tbody', {}, bodyNodes),
        ]
      )
    },
    renderTableCellNode(h, token, { header = false, align = null } = {}) {
      const alignClass = align ? `text-${align}` : ''
      return h(
        header ? 'b-th' : 'b-td',
        {
          class: alignClass,
        },
        this.renderNodes(h, token.tokens)
      )
    },
    renderImageNode(h, token) {
      return h('img', {
        attrs: {
          src: token.href,
          title: token.title || '',
          alt: token.text,
        },
      })
    },
    renderEmNode(h, token) {
      return h('em', {}, this.renderNodes(h, token.tokens))
    },
    renderStrongNode(h, token) {
      return h('strong', {}, this.renderNodes(h, token.tokens))
    },
    renderDelNode(h, token) {
      return h('del', {}, this.renderNodes(h, token.tokens))
    },
    renderCodespanNode(h, token) {
      return h('code', {}, [token.text])
    },
    renderLinkNode(h, token) {
      return h(
        'a',
        {
          attrs: {
            href: token.href,
            title: token.title || '',
            target: '_blank',
            ref: 'noopener noreferrer',
          },
        },
        this.renderNodes(h, token.tokens)
      )
    },
    renderHrNode(h, token) {
      return h('hr')
    },
    renderBrNode(h, token) {
      return h('br')
    },
    renderTextNode(h, token) {
      if (Array.isArray(token.tokens)) {
        return this.renderNodes(h, token.tokens)
      }

      return (token.text || '').split('\n').reduce((prev, text, i) => {
        if (i > 0) {
          prev.push(h('br'))
        }
        prev.push(text)
        return prev
      }, [])
    },
    renderFontawesomeNode(h, token) {
      return h('font-awesome-icon', {
        props: {
          icon: token.icons,
          fixedWidth: true,
        },
      })
    },
  },
  render(h) {
    const tokens = marked.lexer(this.source)
    return h(this.inline ? 'span' : 'div', {}, this.renderNodes(h, tokens))
  },
}
</script>
