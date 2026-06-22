import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { uiTextMap } from '../i18n/uiTextMap';

const originalText = new WeakMap<Text, string>();
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'OPTION']);

function shouldSkip(node: Node) {
  const parent = node.parentElement;
  if (!parent) return true;
  if (SKIP_TAGS.has(parent.tagName)) return true;
  if (parent.closest('[data-no-auto-translate="true"]')) return true;
  if (parent.closest('.arabic-ayah')) return true;
  return false;
}

function translateText(value: string, dict: Record<string, string>) {
  const trimmed = value.trim();
  if (!trimmed) return value;
  const translated = dict[trimmed];
  if (!translated) return value;
  return value.replace(trimmed, translated);
}

function walk(root: ParentNode, dict: Record<string, string>) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return shouldSkip(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  for (const node of nodes) {
    if (!originalText.has(node)) originalText.set(node, node.nodeValue || '');
    const original = originalText.get(node) || '';
    node.nodeValue = translateText(original, dict);
  }
}

export default function GlobalTextTranslator() {
  const { i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage || i18n.language || 'ru').split('-')[0];

  useEffect(() => {
    const dict = uiTextMap[lang] || {};
    if (lang === 'ru' || Object.keys(dict).length === 0) return;

    let frame = 0;
    const apply = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        walk(document.body, dict);
      });
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [lang]);

  return null;
}
