'use client'

import React, { useRef, useImperativeHandle, forwardRef } from 'react';

interface Props {
  markdown: string;
  isDark?: boolean;
}

export interface MindmapViewerRef {
  download: () => void;
}

export const getHtmlTemplate = (markdown: string, isDark: boolean) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script>
    // Live error debugging inside iframe
    window.onerror = function(msg, url, line, col, error) {
      const errDiv = document.createElement('div');
      errDiv.style.position = 'fixed';
      errDiv.style.bottom = '10px';
      errDiv.style.left = '10px';
      errDiv.style.right = '10px';
      errDiv.style.background = 'rgba(239, 68, 68, 0.95)';
      errDiv.style.color = 'white';
      errDiv.style.padding = '12px';
      errDiv.style.borderRadius = '8px';
      errDiv.style.zIndex = '99999';
      errDiv.style.fontFamily = 'monospace';
      errDiv.style.fontSize = '11px';
      errDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      errDiv.innerHTML = '<strong>Iframe JS Error:</strong> ' + msg + '<br>Line: ' + line + ' | Col: ' + col + '<br>Source: ' + url;
      document.body.appendChild(errDiv);
      return false;
    };
  </script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: ${isDark ? "#09090b" : "#f8fafc"};
      color: ${isDark ? "#f4f4f5" : "#0f172a"};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
    }
    svg { width: 100vw; height: 100vh; touch-action: none; }

    .node-card {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: ${isDark ? "#18181b" : "#ffffff"};
      border-radius: 10px;
      padding: 8px 10px 8px 11px;
      border: 1px solid ${isDark ? "#27272a" : "rgba(0,0,0,0.08)"};
      border-left-width: 5px;
      box-shadow: 0 2px 8px ${isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.06)"};
      cursor: pointer;
      font-size: 13px;
      color: ${isDark ? "#e4e4e7" : "#1c1c2e"};
      font-weight: 500;
      line-height: 1.4;
      min-width: 80px;
      white-space: nowrap;
      transition: box-shadow 0.2s, transform 0.15s;
    }
    .node-card:hover {
      box-shadow: 0 4px 14px ${isDark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.12)"};
      transform: translateY(-1px);
    }
    .node-card.root-card {
      font-size: 14px;
      font-weight: 700;
      padding: 12px 14px;
      border-radius: 12px;
      white-space: nowrap;
      border: 1.5px solid ${isDark ? "#3f3f46" : "rgba(0,0,0,0.10)"};
      box-shadow: 0 4px 20px ${isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.09)"};
      text-align: left;
    }
    .node-label { flex: 1; }
    .chevron-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 4px;
      border-radius: 6px;
      background: ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"};
      flex-shrink: 0;
      font-size: 11px;
      font-weight: 600;
    }
    .chevron-btn.expanded { background: ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}; }
    .link { fill: none; stroke-linecap: round; }
  </style>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" crossorigin="anonymous" />
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/d3@7" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/markmap-lib@0.17.0" crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js" crossorigin="anonymous"></script>
</head>
<body>
  <svg id="mindmap">
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#F59E0B" />
      </marker>
    </defs>
  </svg>
  <script>
    // 1. Parse Markdown via Markmap Transformer
    const transformer = new markmap.Transformer();
    const markdownStr = decodeURIComponent("${encodeURIComponent(markdown)}");
    const { root: markmapRoot } = transformer.transform(markdownStr);

    // Parse prerequisite relations from markdownStr
    const relations = [];
    const cleanCourseName = name => {
      let s = name;
      const colonIdx = s.indexOf(':');
      if (colonIdx !== -1 && colonIdx < 12) {
        s = s.substring(colonIdx + 1);
      }
      const dashIdx = s.indexOf(' - ');
      if (dashIdx !== -1 && dashIdx < 12) {
        s = s.substring(dashIdx + 3);
      }
      
      let result = "";
      let depth = 0;
      for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (c === '(') depth++;
        else if (c === ')') depth--;
        else if (depth === 0) result += c;
      }
      
      let cleaned = "";
      for (let i = 0; i < result.length; i++) {
        const c = result[i];
        if (c !== '[' && c !== ']' && c !== '-' && c !== '–' && c !== '—') {
          cleaned += c;
        }
      }
      return cleaned.trim().toLowerCase();
    };
    
    const findNodeByNameOrCode = (nodeList, query) => {
      if (!query) return null;
      
      let cleanQ = "";
      for (let i = 0; i < query.length; i++) {
        const c = query[i];
        if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c === ' ' || c.charCodeAt(0) > 127) {
          cleanQ += c;
        }
      }
      cleanQ = cleanQ.toLowerCase().trim();
      
      let code = null;
      const words = cleanQ.split(' ');
      for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if (w.startsWith("csc") && w.length >= 6) {
          code = w;
          break;
        }
      }
      
      return nodeList.find(n => {
        const content = (n.data.content || "").toLowerCase();
        if (code && content.includes(code)) return true;
        
        let cleanContent = "";
        for (let i = 0; i < content.length; i++) {
          const c = content[i];
          if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c === ' ' || c.charCodeAt(0) > 127) {
            cleanContent += c;
          }
        }
        cleanContent = cleanContent.trim();
        return cleanContent.includes(cleanQ) || cleanQ.includes(cleanContent);
      });
    };

    const lines = markdownStr.split('\n');
    lines.forEach(line => {
      const tqIdx = line.indexOf('[Tiên quyết:');
      if (tqIdx !== -1) {
        const afterTq = line.substring(tqIdx + '[Tiên quyết:'.length);
        const endIdx = afterTq.indexOf(']');
        if (endIdx !== -1) {
          const sourceName = afterTq.substring(0, endIdx).trim();
          let targetPart = line.substring(0, tqIdx).trim();
          while (targetPart.startsWith('-') || targetPart.startsWith('*') || targetPart.startsWith('#') || (targetPart.length > 0 && targetPart[0] >= '0' && targetPart[0] <= '9') || targetPart.startsWith('.')) {
            targetPart = targetPart.substring(1).trim();
          }
          relations.push({ sourceName: cleanCourseName(sourceName), targetName: cleanCourseName(targetPart) });
        }
      }
    });

    const BRANCH_COLORS = ['#3B82F6','#F97316','#22C55E','#EF4444','#A855F7','#EAB308','#06B6D4','#EC4899'];
    const NODE_H_GAP = 280, NODE_V_GAP = 12, CARD_W_EST = 170, CARD_H_EST = 40;

    const svgEl = d3.select('#mindmap');
    const g = svgEl.select('g#canvas').empty() ? svgEl.append('g').attr('id', 'canvas') : svgEl.select('g#canvas');
    const zoom = d3.zoom().scaleExtent([0.1, 3]).on('zoom', e => g.attr('transform', e.transform));
    svgEl.call(zoom);

    let root = d3.hierarchy(markmapRoot, d => d.children);
    let uid = 0;
    const nodeByUid = new Map();
    (function collectAll(n) {
      n.uid = uid++;
      nodeByUid.set(n.uid, n);
      if (n.children) n.children.forEach(collectAll);
    })(root);

    root.branchColor = '#94A3B8';
    function assignColors(node, color) {
      node.branchColor = color;
      if (node.children) node.children.forEach(c => assignColors(c, color));
    }
    (root.children || []).forEach((child, i) => {
      const col = BRANCH_COLORS[i % BRANCH_COLORS.length];
      assignColors(child, col);
    });

    // Dynamic color coding for Core vs Elective courses (including ancestor categories)
    root.each(d => {
      const rawContent = d.data.content || "";
      let isBắtBuộc = rawContent.includes('(Bắt buộc)') || rawContent.toLowerCase().includes('(core)') || rawContent.toLowerCase().includes('(mandatory)');
      let isTựChọn = rawContent.includes('(Tự chọn)') || rawContent.toLowerCase().includes('(elective)');
      
      let curr = d;
      while (curr && !isBắtBuộc && !isTựChọn) {
        const parentContent = (curr.data.content || "").toLowerCase();
        if (parentContent.startsWith("required") || parentContent.includes("bắt buộc") || parentContent.includes("core")) {
          isBắtBuộc = true;
        } else if (parentContent.startsWith("elective") || parentContent.includes("tự chọn") || parentContent.includes("optional")) {
          isTựChọn = true;
        }
        curr = curr.parent;
      }

      if (isBắtBuộc) {
        d.branchColor = '#EF4444'; // Red-Coral for Core
      } else if (isTựChọn) {
        d.branchColor = '#10B981'; // Green-Emerald for Electives
      }
    });

    root.each(d => { d._collapsed = (d.depth >= 2); });

    window.__mmClick = function(uid) {
      const d = nodeByUid.get(+uid);
      if (!d || !hasKids(d)) return;
      d._collapsed = !d._collapsed;
      update();
    };

    const sizeCache = new Map();
    const getLabel = d => {
      let content = d.data.content || (d.depth === 0 ? 'Chủ đề chính' : '');
      
      const tqIdx = content.indexOf('[Tiên quyết:');
      if (tqIdx !== -1) {
        content = content.substring(0, tqIdx);
      }
      const prIdx = content.indexOf('[Prerequisite:');
      if (prIdx !== -1) {
        content = content.substring(0, prIdx);
      }
      
      return content
        .replace('(Bắt buộc)', '')
        .replace('(Tự chọn)', '')
        .replace('(Core)', '')
        .replace('(Elective)', '')
        .replace('(Mandatory)', '')
        .trim();
    };
    const hasKids = d => !!(d.children && d.children.length);

    const measurer = d3.select('body').append('div')
      .attr('style', 'position:absolute; visibility:hidden; top:-9999px; left:-9999px; width: 1000px;');
      
    function renderMathHere(el) {
      if (window.renderMathInElement) {
        window.renderMathInElement(el, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false},
            {left: '\\\\(', right: '\\\\)', display: false},
            {left: '\\\\[', right: '\\\\]', display: true}
          ],
          throwOnError: false
        });
      }
    }

    root.each(d => {
      const isRoot = d.depth === 0;
      const kids = hasKids(d);
      const cls = isRoot ? 'node-card root-card' : 'node-card';
      const chevronText = kids ? d.children.length : '';
      const div = measurer.append('div').attr('class', cls);
      div.html('<span class="node-label" style="white-space: nowrap;">' + getLabel(d) + '</span>' + (kids ? '<div class="chevron-btn">' + chevronText + '</div>' : ''));
      renderMathHere(div.node());
      const rect = div.node().getBoundingClientRect();
      sizeCache.set(d.uid, { w: Math.ceil(rect.width) + 2, h: Math.ceil(rect.height) + 2 });
    });
    measurer.remove();

    function subtreeHeight(d) {
      const h = (sizeCache.get(d.uid) || { h: CARD_H_EST }).h;
      if (!d.children || !d.children.length || d._collapsed) return h + NODE_V_GAP;
      
      return Math.max(h + NODE_V_GAP, d.children.reduce((a, c) => a + subtreeHeight(c), 0));
    }

    function getVisibleNodes(node) {
      let res = [node];
      if (node.children && !node._collapsed) {
        node.children.forEach(c => { res = res.concat(getVisibleNodes(c)); });
      }
      return res;
    }

    function getVisibleLinks(node) {
      let res = [];
      if (node.children && !node._collapsed) {
        node.children.forEach(c => {
          res.push({ source: node, target: c });
          res = res.concat(getVisibleLinks(c));
        });
      }
      return res;
    }

    function layout(d, x, y) {
      const sz = sizeCache.get(d.uid) || { w: CARD_W_EST, h: CARD_H_EST };
      d.lx = x; d.ly = y - sz.h / 2; d.cw = sz.w; d.ch = sz.h;
      if (d.children && d.children.length) {
        const total = subtreeHeight(d);
        let cy = y - total / 2;
        d.children.forEach(child => {
          const ch = subtreeHeight(child);
          layout(child, x + sz.w + NODE_H_GAP, cy + ch / 2);
          cy += ch;
        });
      }
    }

    function diagonal(s, t) {
      const mx = (s.x + t.x) / 2;
      return "M " + s.x + " " + s.y + " C " + mx + " " + s.y + ", " + mx + " " + t.y + ", " + t.x + " " + t.y;
    }

    function update() {
      layout(root, 0, 0);
      const nodes = getVisibleNodes(root);
      const links = getVisibleLinks(root);

      const src = d => ({ x: d.source.lx + (d.source.cw || CARD_W_EST), y: d.source.ly + (d.source.ch || CARD_H_EST) / 2 });
      const tgt = d => ({ x: d.target.lx, y: d.target.ly + (d.target.ch || CARD_H_EST) / 2 });

      const linkSel = g.selectAll('path.link').data(links, d => d.target.uid);
      linkSel.enter().insert('path', 'g.node')
        .attr('class', 'link')
        .attr('stroke', d => d.target.branchColor || '#CBD5E1')
        .attr('stroke-width', d => d.source.depth === 0 ? 4 : 3)
        .attr('stroke-opacity', 1)
        .attr('opacity', 0)
        .merge(linkSel)
        .transition().duration(350).ease(d3.easeCubicOut)
        .attr('opacity', 1)
        .attr('d', d => diagonal(src(d), tgt(d)));
      linkSel.exit().transition().duration(250).attr('opacity', 0).remove();

      const nodeSel = g.selectAll('g.node').data(nodes, d => d.uid);
      const nodeEnter = nodeSel.enter().append('g')
        .attr('class', 'node').attr('opacity', 0)
        .attr('transform', d => "translate(" + d.lx + "," + d.ly + ")");

      nodeEnter.append('foreignObject').attr('width', 260).attr('height', 120).attr('x', 0).attr('y', 0)
        .append('xhtml:div').attr('class', 'card-wrapper');

      const nodeUpdate = nodeEnter.merge(nodeSel);
      nodeUpdate.select('.card-wrapper').html(d => {
        const isRoot = d.depth === 0;
        const color = d.branchColor || '#94A3B8';
        const kids = hasKids(d);
        const expanded = kids && !d._collapsed;
        const chevronText = kids ? d.children.length : '';
        const cls = isRoot ? 'node-card root-card' : 'node-card';
        const leftStyle = isRoot ? '' : 'border-left-color:' + color + ';';
        const clickAttr = hasKids(d) ? 'onclick="window.__mmClick(' + d.uid + ')" style="cursor:pointer;' + leftStyle + '"' : 'style="' + leftStyle + '"';
        return '<div class="' + cls + '" ' + clickAttr + '><span class="node-label">' + getLabel(d) + '</span>' + (kids ? '<div class="chevron-btn ' + (expanded ? 'expanded' : '') + '" style="color:' + color + ';">' + chevronText + '</div>' : '') + '</div>';
      });
      
      nodeUpdate.select('.card-wrapper').each(function(d) {
        renderMathHere(this);
      });
      
      nodeUpdate.select('foreignObject').attr('width', 800).attr('height', 120);

      nodeUpdate.transition().duration(350).ease(d3.easeCubicOut)
        .attr('opacity', 1).attr('transform', d => "translate(" + d.lx + "," + d.ly + ")");
      nodeSel.exit().transition().duration(250).attr('opacity', 0).remove();
      
      nodeUpdate.each(function(d) {
        const sz = sizeCache.get(d.uid);
        d3.select(this).select('foreignObject').attr('width', sz.w + 2).attr('height', sz.h + 2);
      });

      // Clear and draw relation links for prerequisites
      setTimeout(() => {
        g.selectAll('path.relation-link').remove();
        g.selectAll('text.relation-label').remove();
        
        relations.forEach(rel => {
          const sourceNode = findNodeByNameOrCode(nodes, rel.sourceName);
          const targetNode = findNodeByNameOrCode(nodes, rel.targetName);
          
          if (sourceNode && targetNode) {
            const sX = sourceNode.lx + (sourceNode.cw || CARD_W_EST);
            const sY = sourceNode.ly + (sourceNode.ch || CARD_H_EST) / 2;
            const tX = targetNode.lx;
            const tY = targetNode.ly + (targetNode.ch || CARD_H_EST) / 2;
            
            const dx = Math.abs(tX - sX);
            const dy = tY - sY;
            const pathData = "M " + sX + " " + sY + " C " + (sX + 60) + " " + sY + ", " + (tX - 60) + " " + tY + ", " + tX + " " + tY;
            
            g.append('path')
              .attr('class', 'relation-link')
              .attr('d', pathData)
              .attr('fill', 'none')
              .attr('stroke', '#F59E0B') 
              .attr('stroke-width', 2.5)
              .attr('stroke-dasharray', '6,4')
              .attr('opacity', 0.85)
              .attr('marker-end', 'url(#arrow)');
              
            const midX = (sX + tX) / 2;
            const midY = (sY + tY) / 2 + (dy > 0 ? -8 : 12);
            g.append('text')
              .attr('class', 'relation-label')
              .attr('x', midX)
              .attr('y', midY)
              .attr('text-anchor', 'middle')
              .attr('fill', '#D97706')
              .attr('font-size', '9px')
              .attr('font-weight', 'bold')
              .attr('style', 'font-family: sans-serif; text-shadow: 0 1px 2px rgba(255,255,255,0.8);')
              .text('tiên quyết');
          }
        });
      }, 350);
    }

    // Centering function
    function centerRoot() {
      const rootSz = sizeCache.get(root.uid) || { w: CARD_W_EST, h: CARD_H_EST };
      const currentW = window.innerWidth || 800;
      const currentH = window.innerHeight || 600;
      svgEl.call(zoom.transform, d3.zoomIdentity.translate(currentW * 0.15, currentH * 0.5 - rootSz.h / 2));
    }

    update();
    setTimeout(centerRoot, 150);

    // Auto update centering on resize
    window.addEventListener('resize', () => {
      centerRoot();
    });

    window.downloadPNG = function() {
      const svg = document.getElementById('mindmap');
      if (!svg.getAttribute("xmlns")) {
          svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      }
      
      const bbox = g.node().getBBox();
      const padding = 50;
      const width = bbox.width + padding * 2;
      const height = bbox.height + padding * 2;
      
      const clonedSvg = svg.cloneNode(true);
      clonedSvg.setAttribute("viewBox", (bbox.x - padding) + " " + (bbox.y - padding) + " " + width + " " + height);
      clonedSvg.setAttribute("width", width);
      clonedSvg.setAttribute("height", height);
      
      const styleEl = document.createElement("style");
      styleEl.textContent = ".node-card { background: ${isDark ? "#18181b" : "#FFFFFF"}; border-radius: 10px; border: 1px solid ${isDark ? "#27272a" : "rgba(0,0,0,0.08)"}; padding: 8px 10px 8px 11px; font-size: 13px; font-family: -apple-system, sans-serif; color: ${isDark ? "#e4e4e7" : "#1c1c2e"}; } " +
        ".root-card { font-size: 14px; font-weight: bold; padding: 12px 14px; } " +
        ".chevron-btn { display: none; } " +
        ".link { fill: none; stroke-linecap: round; }";
      clonedSvg.insertBefore(styleEl, clonedSvg.firstChild);
      
      clonedSvg.querySelector('#canvas').removeAttribute('transform');

      const foreignObjects = clonedSvg.querySelectorAll('foreignObject');
      foreignObjects.forEach(fo => {
        const div = fo.querySelector('div');
        if (div && !div.getAttribute('xmlns')) {
          div.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
        }
      });
      
      const svgData = new XMLSerializer().serializeToString(clonedSvg);
      const blob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
      const url = URL.createObjectURL(blob);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      const scale = 2;
      canvas.width = width * scale;
      canvas.height = height * scale;
      
      img.onload = function() {
        ctx.fillStyle = '${isDark ? "#09090b" : "#F5F6FA"}';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        
        URL.revokeObjectURL(url);
        
        try {
          const pngUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = 'mindmap.png';
          link.href = pngUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (e) {
          fallbackSvg();
        }
      };
      
      img.onerror = function() {
        fallbackSvg();
      };
      img.src = url;

      function fallbackSvg() {
        const fbLink = document.createElement("a");
        const fbUrl = URL.createObjectURL(new Blob([svgData], {type: "image/svg+xml;charset=utf-8"}));
        fbLink.href = fbUrl;
        fbLink.download = "mindmap.svg";
        document.body.appendChild(fbLink);
        fbLink.click();
        document.body.removeChild(fbLink);
      }
    };

    window.addEventListener('message', (event) => {
      if (event.data === 'download-png') {
         window.downloadPNG();
      }
    });
  </script>
</body>
</html>
`;

export const MindmapViewer = forwardRef<MindmapViewerRef, Props>(({ markdown, isDark = false }, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useImperativeHandle(ref, () => ({
    download: () => {
      iframeRef.current?.contentWindow?.postMessage('download-png', '*');
    }
  }));

  const htmlContent = getHtmlTemplate(markdown, isDark);

  return (
    <div className="w-full h-full min-h-[450px] relative overflow-hidden rounded-2xl border border-white/20 dark:border-zinc-800/50 shadow-md bg-slate-50 dark:bg-zinc-950">
      <iframe
        ref={iframeRef}
        srcDoc={htmlContent}
        className="w-full h-full border-none bg-transparent"
        sandbox="allow-scripts allow-same-origin allow-downloads"
      />
    </div>
  );
});

MindmapViewer.displayName = "MindmapViewer";
