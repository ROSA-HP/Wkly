import React, { useState, useMemo, useEffect } from 'react';

export const PALETTE_COLORS = [
  'Pink',
  'Blue',
  'Mint',
  'Peach',
  'Lavender',
  'Coral',
  'Yellow',
  'Soft Gray',
  'Lilac',
  'Green',
];

export const COLOR_HEX_MAP = {
  Pink: { pastel: '#ffd1dc', accent: '#f472b6', text: '#121212', tintClass: 'bg-[#FFD1DC]' },
  Blue: { pastel: '#bae6fd', accent: '#38bdf8', text: '#121212', tintClass: 'bg-[#BAE6FD]' },
  Mint: { pastel: '#bbf7d0', accent: '#10b981', text: '#121212', tintClass: 'bg-[#A7F3D0]' },
  Peach: { pastel: '#fed7aa', accent: '#fb923c', text: '#121212', tintClass: 'bg-[#FED7AA]' },
  Lavender: { pastel: '#f3e8ff', accent: '#a855f7', text: '#121212', tintClass: 'bg-[#E9D5FF]' },
  Coral: { pastel: '#fca5a5', accent: '#fb7185', text: '#121212', tintClass: 'bg-[#FECDD3]' },
  Yellow: { pastel: '#fef08a', accent: '#eab308', text: '#121212', tintClass: 'bg-[#FEF08A]' },
  'Soft Gray': { pastel: '#e2e8f0', accent: '#64748b', text: '#121212', tintClass: 'bg-[#E2E8F0]' },
  Lilac: { pastel: '#e9ddff', accent: '#8455ef', text: '#121212', tintClass: 'bg-[#F5D0FE]' },
  Green: { pastel: '#acedff', accent: '#008096', text: '#121212', tintClass: 'bg-[#BBF7D0]' },
};

const DAY_NAME_TO_YMD = {
  Monday: '2026-09-28',
  Tuesday: '2026-09-29',
  Wednesday: '2026-09-30',
  Thursday: '2026-10-01',
  Friday: '2026-10-02',
  Saturday: '2026-10-03',
  Sunday: '2026-10-04',
};

const YMD_TO_DAY_NAME = {
  '2026-09-28': 'Monday',
  '2026-09-29': 'Tuesday',
  '2026-09-30': 'Wednesday',
  '2026-10-01': 'Thursday',
  '2026-10-02': 'Friday',
  '2026-10-03': 'Saturday',
  '2026-10-04': 'Sunday',
};

const DAY_SHORT_LABELS = {
  Monday: 'Mon, Sep 28',
  Tuesday: 'Tue, Sep 29',
  Wednesday: 'Wed, Sep 30',
  Thursday: 'Thu, Oct 01',
  Friday: 'Fri, Oct 02',
  Saturday: 'Sat, Oct 03',
  Sunday: 'Sun, Oct 04',
};

const AI_EXAMPLE_PROMPTS = [
  {
    title: 'ESP32 Greenhouse Calibration',
    prompt:
      'Add ESP32 sensor calibration for my greenhouse project on Friday at 4pm for 2 hours. Mint color. I need to track the hardware used and add a checklist for DHT11 and Flow Sensor.',
  },
  {
    title: 'Karate Conditioning (Sets & Reps)',
    prompt:
      'Log Karate conditioning tomorrow at 7 AM. 45 minutes. Pink. I need fields for explosive pull ups (sets and reps) and deep squats (sets and reps).',
  },
];

function to24HourTime(rawTime) {
  if (!rawTime) return '14:00';
  const trimmed = String(rawTime).trim();
  const ampmMatch = trimmed.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1], 10);
    const m = parseInt(ampmMatch[2], 10) || 0;
    const p = ampmMatch[3].toUpperCase();
    if (p === 'PM' && h < 12) h += 12;
    if (p === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  const h24Match = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (h24Match) {
    const h = Math.min(23, Math.max(0, parseInt(h24Match[1], 10)));
    const m = Math.min(59, Math.max(0, parseInt(h24Match[2], 10)));
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  return '14:00';
}

function to12HourTime(time24) {
  const clean = to24HourTime(time24);
  const [hStr, mStr] = clean.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10) || 0;
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

function extractDurationNumber(raw) {
  if (typeof raw === 'number' && !isNaN(raw)) return String(raw);
  const digits = String(raw || '').replace(/\D/g, '');
  return digits || '90';
}

function normalizeChecklistItems(val) {
  if (Array.isArray(val)) {
    return val.map((item, idx) => {
      if (typeof item === 'string') {
        return { id: `chk-${idx}-${Date.now()}`, text: item, checked: false };
      }
      return {
        id: item.id || `chk-${idx}-${Date.now()}`,
        text: String(item.text ?? item.value ?? ''),
        checked: Boolean(item.checked),
      };
    });
  }
  if (typeof val === 'string' && val.trim() !== '') {
    return val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((text, idx) => ({ id: `chk-${idx}-${Date.now()}`, text, checked: false }));
  }
  return [
    {
      id: `chk-1-${Date.now()}`,
      text: 'Verify 3.3V rail voltage & inspect high-frequency decouple capacitors',
      checked: true,
    },
    {
      id: `chk-2-${Date.now()}`,
      text: 'Flash FreeRTOS dual-core telemetry firmware onto micro-controller',
      checked: true,
    },
    {
      id: `chk-3-${Date.now()}`,
      text: 'Log tri-axial accelerometer & sprint cadence telemetry stream',
      checked: false,
    },
  ];
}

function buildDefaultCanvasFields(initialTask) {
  const existingCanvas =
    initialTask?.canvasFields || initialTask?.details?.canvasFields;
  if (Array.isArray(existingCanvas) && existingCanvas.length > 0) {
    return existingCanvas.map((cf, i) => ({
      id: cf.id || `cf-${i}-${Date.now()}`,
      label: cf.label || `Field ${i + 1}`,
      value:
        cf.type === 'checklist'
          ? normalizeChecklistItems(cf.value)
          : cf.type === 'number'
          ? Number(cf.value) || 0
          : String(cf.value ?? ''),
      type: cf.type || 'text',
      layoutSize: cf.layoutSize || (cf.type === 'checklist' || cf.type === 'longText' ? 'full-width' : 'half-width'),
      unit: cf.unit || '',
      subtitle: cf.subtitle || '',
    }));
  }

  // Default rich canvas blocks matching the Neo-Brutalist Canvas V2.4 specification
  return [
    {
      id: `cf-1-${Date.now()}`,
      label: 'Target Baud Rate / Sets',
      value: 5,
      type: 'number',
      layoutSize: 'half-width',
      unit: 'SETS',
      subtitle: 'UART0 • Telemetry High-Speed Split',
    },
    {
      id: `cf-2-${Date.now() + 1}`,
      label: 'Sampling Frequency / Reps',
      value: 12,
      type: 'number',
      layoutSize: 'half-width',
      unit: 'REPS',
      subtitle: 'Equivalent: 12 High-Velocity Reps',
    },
    {
      id: `cf-3-${Date.now() + 2}`,
      label: 'Sensor Address / Hardware',
      value: '0x68 (MPU6050) • ESP32',
      type: 'text',
      layoutSize: 'half-width',
      subtitle: 'Inter-IC Clock: 400 kHz Fast-Mode',
    },
    {
      id: `cf-4-${Date.now() + 3}`,
      label: 'Diagnostic / Drill Checklist',
      value: [
        {
          id: 'chk-init-1',
          text: 'Verify 3.3V rail voltage & inspect high-frequency decouple capacitors',
          checked: true,
        },
        {
          id: 'chk-init-2',
          text: 'Flash FreeRTOS dual-core telemetry firmware onto micro-controller',
          checked: true,
        },
        {
          id: 'chk-init-3',
          text: 'Log tri-axial accelerometer & sprint cadence telemetry stream',
          checked: false,
        },
      ],
      type: 'checklist',
      layoutSize: 'half-width',
    },
    {
      id: `cf-5-${Date.now() + 4}`,
      label: 'Notes & Protocol Specification',
      value:
        'Calibrate gyro drift offset at 25°C ambient before endurance run. Ensure BLE peripheral advertising interval is locked to 50ms for low-latency athlete tracking.',
      type: 'longText',
      layoutSize: 'full-width',
    },
  ];
}

export function NewTaskModal({
  isOpen = true,
  onClose,
  onSave,
  defaultDay = 'Wednesday',
  initialTask = null,
}) {
  // Fixed Data state ("taskName", "day" YYYY-MM-DD, "startingTime" HH:MM 24h, "durationMinutes" Number, "color")
  const [taskName, setTaskName] = useState(
    () =>
      initialTask?.fixedData?.taskName ||
      initialTask?.taskName ||
      initialTask?.title ||
      'ESP32 Sensor Calibration & High-Load Telemetry'
  );
  const [selectedDayName, setSelectedDayName] = useState(
    () => initialTask?.day || defaultDay || 'Wednesday'
  );
  const [startingTime24, setStartingTime24] = useState(() =>
    to24HourTime(initialTask?.fixedData?.startingTime || initialTask?.time || '14:00')
  );
  const [durationDigits, setDurationDigits] = useState(() =>
    extractDurationNumber(
      initialTask?.fixedData?.durationMinutes ?? initialTask?.duration ?? 90
    )
  );
  const [selectedColor, setSelectedColor] = useState(
    () => initialTask?.fixedData?.color || initialTask?.color || 'Mint'
  );
  const [sprintTag, setSprintTag] = useState(
    () => initialTask?.details?.tag || 'Hardware Sprint • Athletics'
  );

  // Popover toggles for the metadata pills
  const [activePillPopover, setActivePillPopover] = useState(null); // 'date' | 'time' | null

  // Canvas Fields state
  const [canvasFields, setCanvasFields] = useState(() =>
    buildDefaultCanvasFields(initialTask)
  );
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [checklistDrafts, setChecklistDrafts] = useState({});

  // Mouse Drag-and-Drop & Edge-Resize state for Canvas Blocks (60fps Pointer Engine)
  const [mouseDrag, setMouseDrag] = useState(null);
  // mouseDrag shape: { mode: 'block' | 'palette', blockId?, paletteItem?, clientX, clientY, offsetX, offsetY, width, height }
  const [resizingBlockId, setResizingBlockId] = useState(null);
  const [draggedChecklistItem, setDraggedChecklistItem] = useState(null); // { blockId, itemIdx }
  const canvasGridRef = React.useRef(null);
  const canvasScrollRef = React.useRef(null);

  // AI Natural Language Parser & JSON Inspector
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isParsingAi, setIsParsingAi] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [tokenQuota, setTokenQuota] = useState({
    dailyTokenLimit: 15000,
    tokensUsedToday: 0,
    remainingTokens: 15000,
    maxTokensPerRequest: 1500,
  });
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/tasks/token-usage', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.dailyTokenLimit === 'number') {
          setTokenQuota(data);
        }
      })
      .catch(() => {});
  }, [isOpen, showAiDrawer]);

  useEffect(() => {
    if (initialTask) {
      setTaskName(
        initialTask.fixedData?.taskName ||
          initialTask.taskName ||
          initialTask.title ||
          'Untitled Task'
      );
      setSelectedDayName(initialTask.day || defaultDay || 'Wednesday');
      setStartingTime24(
        to24HourTime(initialTask.fixedData?.startingTime || initialTask.time || '14:00')
      );
      setDurationDigits(
        extractDurationNumber(
          initialTask.fixedData?.durationMinutes ?? initialTask.duration ?? 90
        )
      );
      setSelectedColor(
        initialTask.fixedData?.color || initialTask.color || initialTask.details?.color || 'Mint'
      );
      setSprintTag(initialTask.details?.tag || 'Hardware Sprint • Athletics');
      setCanvasFields(buildDefaultCanvasFields(initialTask));
    } else {
      setSelectedDayName(defaultDay || 'Wednesday');
    }
  }, [initialTask, defaultDay]);

  const activeColorMeta = useMemo(
    () => COLOR_HEX_MAP[selectedColor] || COLOR_HEX_MAP.Mint,
    [selectedColor]
  );

  // Compiled Wkly JSON Schema output matching the exact prompt specification
  const compiledWklyJson = useMemo(() => {
    const ymd = DAY_NAME_TO_YMD[selectedDayName] || '2026-09-30';
    const durNum = Math.max(1, parseInt(durationDigits, 10) || 60);

    const formattedCanvasFields = canvasFields.map((cf) => {
      let cleanValue = cf.value;
      if (cf.type === 'number') {
        cleanValue = Number(cf.value) || 0;
      } else if (cf.type === 'checklist') {
        const items = normalizeChecklistItems(cf.value);
        cleanValue = items.map((i) => i.text).filter(Boolean);
      } else {
        cleanValue = String(cf.value ?? '');
      }
      return {
        label: cf.label || 'Untitled Field',
        value: cleanValue,
        type: cf.type,
        layoutSize: cf.layoutSize,
      };
    });

    return [
      {
        fixedData: {
          taskName: taskName.trim() || 'Untitled Task',
          day: ymd,
          startingTime: startingTime24,
          durationMinutes: durNum,
          color: selectedColor,
        },
        canvasFields: formattedCanvasFields,
      },
    ];
  }, [taskName, selectedDayName, startingTime24, durationDigits, selectedColor, canvasFields]);

  if (!isOpen) return null;

  // Numbers-only Duration Handler
  const handleDurationChange = (rawVal) => {
    const digitsOnly = String(rawVal).replace(/\D/g, '');
    setDurationDigits(digitsOnly);
  };

  const handleDurationBlur = () => {
    if (!durationDigits || parseInt(durationDigits, 10) <= 0) {
      setDurationDigits('60');
    } else {
      setDurationDigits(String(parseInt(durationDigits, 10)));
    }
  };

  // Add Blocks from Bottom Palette Dock (supports optional targetIndex when dropped by mouse)
  const createBlocksForType = (blockType, customPreset = null, existingList = []) => {
    const id = `cf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    if (customPreset === 'sets-reps-pair') {
      const id1 = `cf-${Date.now()}-sets`;
      const id2 = `cf-${Date.now() + 1}-reps`;
      return [
        {
          id: id1,
          label: 'Exercise Sets',
          value: 4,
          type: 'number',
          layoutSize: 'half-width',
          unit: 'SETS',
          subtitle: 'Target working sets',
        },
        {
          id: id2,
          label: 'Exercise Reps',
          value: 8,
          type: 'number',
          layoutSize: 'half-width',
          unit: 'REPS',
          subtitle: 'Target repetitions per set',
        },
      ];
    }

    if (blockType === 'number') {
      return [
        {
          id,
          label: `Metric / Sets #${existingList.filter((f) => f.type === 'number').length + 1}`,
          value: 10,
          type: 'number',
          layoutSize: 'half-width',
          unit: 'UNITS',
          subtitle: 'Numeric parameter',
        },
      ];
    }
    if (blockType === 'text') {
      return [
        {
          id,
          label: customPreset === 'tags' ? 'Tag / Hardware' : 'Project / Property',
          value: customPreset === 'tags' ? 'ESP32 • Sensor' : '',
          type: 'text',
          layoutSize: 'half-width',
          subtitle: 'Short text metadata',
        },
      ];
    }
    if (blockType === 'checklist') {
      return [
        {
          id,
          label: 'Execution / Drill Checklist',
          value: [
            { id: `chk-${Date.now()}-1`, text: 'Checklist item 1', checked: false },
          ],
          type: 'checklist',
          layoutSize: 'full-width',
        },
      ];
    }
    return [
      {
        id,
        label: 'Notes & Protocol Specification',
        value: '',
        type: 'longText',
        layoutSize: 'full-width',
      },
    ];
  };

  const handleAddBlock = (blockType, customPreset = null, insertAtIndex = null) => {
    setCanvasFields((prev) => {
      const newBlocks = createBlocksForType(blockType, customPreset, prev);
      if (newBlocks.length > 0) {
        setActiveBlockId(newBlocks[0].id);
      }
      if (typeof insertAtIndex === 'number' && insertAtIndex >= 0 && insertAtIndex <= prev.length) {
        const next = [...prev];
        next.splice(insertAtIndex, 0, ...newBlocks);
        return next;
      }
      return [...prev, ...newBlocks];
    });
  };

  // Move Block Up/Left or Down/Right by index
  const handleMoveBlockStep = (id, direction) => {
    setCanvasFields((prev) => {
      const idx = prev.findIndex((cf) => cf.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(idx, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
  };

  // Helper: Find target index in canvasFields based on mouse coordinates (clientX, clientY)
  const reorderBlockByCursor = (draggedId, clientX, clientY) => {
    const gridEl = canvasGridRef.current;
    if (!gridEl) return;

    const blockNodes = Array.from(gridEl.querySelectorAll('[data-canvas-block-id]'));
    if (blockNodes.length <= 1) return;

    const draggedNode = gridEl.querySelector(`[data-canvas-block-id="${draggedId}"]`);
    const dragRect = draggedNode ? draggedNode.getBoundingClientRect() : null;

    // Check if cursor is above first block or below last block
    const firstRect = blockNodes[0].getBoundingClientRect();
    const lastRect = blockNodes[blockNodes.length - 1].getBoundingClientRect();

    if (clientY < firstRect.top - 16) {
      setCanvasFields((prev) => {
        const fromIdx = prev.findIndex((cf) => cf.id === draggedId);
        if (fromIdx <= 0) return prev;
        const next = [...prev];
        const [moved] = next.splice(fromIdx, 1);
        next.unshift(moved);
        return next;
      });
      return;
    }

    if (clientY > lastRect.bottom + 16) {
      setCanvasFields((prev) => {
        const fromIdx = prev.findIndex((cf) => cf.id === draggedId);
        if (fromIdx === -1 || fromIdx === prev.length - 1) return prev;
        const next = [...prev];
        const [moved] = next.splice(fromIdx, 1);
        next.push(moved);
        return next;
      });
      return;
    }

    // If cursor is currently inside the dragged block's own placeholder slot, keep position stable
    if (
      dragRect &&
      clientX >= dragRect.left &&
      clientX <= dragRect.right &&
      clientY >= dragRect.top &&
      clientY <= dragRect.bottom
    ) {
      return;
    }

    // Check each non-dragged block to see if cursor is over it
    for (const node of blockNodes) {
      const targetId = node.getAttribute('data-canvas-block-id');
      if (!targetId || targetId === draggedId) continue;

      const rect = node.getBoundingClientRect();
      const isInsideY = clientY >= rect.top - 6 && clientY <= rect.bottom + 6;
      const isInsideX = clientX >= rect.left - 6 && clientX <= rect.right + 6;

      if (isInsideX && isInsideY) {
        setCanvasFields((prev) => {
          const fromIdx = prev.findIndex((cf) => cf.id === draggedId);
          const toIdx = prev.findIndex((cf) => cf.id === targetId);
          if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return prev;

          const sameRow =
            dragRect &&
            Math.abs(dragRect.top - rect.top) < Math.min(dragRect.height, rect.height) * 0.55;

          if (sameRow) {
            if (fromIdx < toIdx && clientX < rect.left + rect.width * 0.3) return prev;
            if (fromIdx > toIdx && clientX > rect.right - rect.width * 0.3) return prev;
          } else {
            if (fromIdx < toIdx && clientY < rect.top + rect.height * 0.28) return prev;
            if (fromIdx > toIdx && clientY > rect.bottom - rect.height * 0.28) return prev;
          }

          const next = [...prev];
          const [moved] = next.splice(fromIdx, 1);
          next.splice(toIdx, 0, moved);
          return next;
        });
        break;
      }
    }
  };

  // Start 60fps Mouse Drag on any Canvas Block
  const handleBlockPointerDown = (e, blockId, forceGrip = false) => {
    if (e.button !== 0) return; // left click only

    const target = e.target;
    const tag = target?.tagName;

    // Never hijack clicks on buttons, selects, or resize handles
    if (
      !forceGrip &&
      (tag === 'BUTTON' ||
        tag === 'SELECT' ||
        tag === 'OPTION' ||
        target?.closest('button') ||
        target?.closest('select') ||
        target?.closest('[data-no-drag="true"]'))
    ) {
      return;
    }

    // If user is clicking inside an ALREADY focused input or textarea, let them select text normally
    if (
      !forceGrip &&
      (tag === 'INPUT' || tag === 'TEXTAREA') &&
      document.activeElement === target
    ) {
      return;
    }

    const blockEl = e.currentTarget.closest('[data-canvas-block-id]');
    if (!blockEl) return;

    const rect = blockEl.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const offsetX = startX - rect.left;
    const offsetY = startY - rect.top;

    let hasStartedDragging = false;

    if (forceGrip) {
      e.preventDefault();
    }

    setActiveBlockId(blockId);

    const onMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      if (!hasStartedDragging) {
        const threshold = forceGrip ? 2 : 6;
        if (Math.hypot(dx, dy) < threshold) return;
        hasStartedDragging = true;
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
          document.activeElement.blur();
        }
        window.getSelection()?.removeAllRanges();
      }

      moveEvent.preventDefault();

      // Auto-scroll canvas container when dragging near top or bottom edge
      const scrollEl = canvasScrollRef.current;
      if (scrollEl) {
        const scrollRect = scrollEl.getBoundingClientRect();
        if (moveEvent.clientY < scrollRect.top + 55) {
          scrollEl.scrollTop -= 10;
        } else if (moveEvent.clientY > scrollRect.bottom - 55) {
          scrollEl.scrollTop += 10;
        }
      }

      setMouseDrag({
        mode: 'block',
        blockId,
        clientX: moveEvent.clientX,
        clientY: moveEvent.clientY,
        offsetX,
        offsetY,
        width: rect.width,
        height: rect.height,
      });

      reorderBlockByCursor(blockId, moveEvent.clientX, moveEvent.clientY);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (hasStartedDragging) {
        setMouseDrag(null);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Start Mouse Drag from Bottom Palette Dock Chip (Click to append, or Drag onto Canvas!)
  const handlePaletteChipMouseDown = (e, blockType, customPreset = null, labelText = '+ Block') => {
    if (e.button !== 0) return;
    const startX = e.clientX;
    const startY = e.clientY;
    let isDraggingPalette = false;

    const onMouseMove = (moveEvent) => {
      const dist = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);
      if (!isDraggingPalette) {
        if (dist < 6) return;
        isDraggingPalette = true;
      }
      moveEvent.preventDefault();
      setMouseDrag({
        mode: 'palette',
        paletteItem: { blockType, customPreset, labelText },
        clientX: moveEvent.clientX,
        clientY: moveEvent.clientY,
        offsetX: 60,
        offsetY: 18,
        width: 160,
        height: 40,
      });
    };

    const onMouseUp = (upEvent) => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      if (isDraggingPalette) {
        setMouseDrag(null);
        // Check if released inside the canvas workspace
        const scrollEl = canvasScrollRef.current;
        if (scrollEl) {
          const sRect = scrollEl.getBoundingClientRect();
          if (
            upEvent.clientX >= sRect.left &&
            upEvent.clientX <= sRect.right &&
            upEvent.clientY >= sRect.top &&
            upEvent.clientY <= sRect.bottom
          ) {
            // Find hovered block index if any
            let insertIdx = null;
            const gridEl = canvasGridRef.current;
            if (gridEl) {
              const nodes = Array.from(gridEl.querySelectorAll('[data-canvas-block-id]'));
              for (let i = 0; i < nodes.length; i++) {
                const r = nodes[i].getBoundingClientRect();
                if (
                  upEvent.clientX >= r.left &&
                  upEvent.clientX <= r.right &&
                  upEvent.clientY >= r.top &&
                  upEvent.clientY <= r.bottom
                ) {
                  insertIdx = i;
                  break;
                }
              }
            }
            handleAddBlock(blockType, customPreset, insertIdx);
          }
        }
      } else {
        // Normal click (< 6px movement): immediately add block to canvas
        handleAddBlock(blockType, customPreset);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Mouse Edge Drag-to-Resize (Half-Width 6-Col <-> Full-Width 12-Col)
  const handleStartResizeBlock = (e, blockId) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingBlockId(blockId);
    setActiveBlockId(blockId);

    const gridEl = canvasGridRef.current;
    if (!gridEl) return;
    const gridRect = gridEl.getBoundingClientRect();

    const onMouseMove = (moveEvent) => {
      const relativeX = moveEvent.clientX - gridRect.left;
      const ratio = relativeX / Math.max(1, gridRect.width);
      const desiredSize = ratio > 0.62 ? 'full-width' : 'half-width';
      setCanvasFields((prev) =>
        prev.map((cf) =>
          cf.id === blockId && cf.layoutSize !== desiredSize
            ? { ...cf, layoutSize: desiredSize }
            : cf
        )
      );
    };

    const onMouseUp = () => {
      setResizingBlockId(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Checklist sub-item smooth mouse drag reordering
  const handleChecklistMouseDown = (e, blockId, startIdx) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    let currentIdx = startIdx;
    setDraggedChecklistItem({ blockId, itemIdx: currentIdx });

    const onMouseMove = (moveEvent) => {
      const rowNodes = Array.from(
        document.querySelectorAll(`[data-checklist-block="${blockId}"]`)
      );
      for (let i = 0; i < rowNodes.length; i++) {
        if (i === currentIdx) continue;
        const r = rowNodes[i].getBoundingClientRect();
        if (moveEvent.clientY >= r.top && moveEvent.clientY <= r.bottom) {
          const fromIdx = currentIdx;
          const targetIdx = i;
          currentIdx = targetIdx;
          setDraggedChecklistItem({ blockId, itemIdx: targetIdx });
          setCanvasFields((prev) =>
            prev.map((cf) => {
              if (cf.id !== blockId) return cf;
              const items = [...normalizeChecklistItems(cf.value)];
              if (
                fromIdx < 0 ||
                fromIdx >= items.length ||
                targetIdx < 0 ||
                targetIdx >= items.length
              ) {
                return cf;
              }
              const [moved] = items.splice(fromIdx, 1);
              items.splice(targetIdx, 0, moved);
              return { ...cf, value: items };
            })
          );
          break;
        }
      }
    };

    const onMouseUp = () => {
      setDraggedChecklistItem(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleUpdateBlock = (id, patch) => {
    setCanvasFields((prev) =>
      prev.map((cf) => (cf.id === id ? { ...cf, ...patch } : cf))
    );
  };

  const handleRemoveBlock = (id) => {
    setCanvasFields((prev) => prev.filter((cf) => cf.id !== id));
  };

  const handleToggleLayoutSize = (id) => {
    setCanvasFields((prev) =>
      prev.map((cf) =>
        cf.id === id
          ? {
              ...cf,
              layoutSize: cf.layoutSize === 'half-width' ? 'full-width' : 'half-width',
            }
          : cf
      )
    );
  };

  const handleSwitchBlockType = (id, nextType) => {
    setCanvasFields((prev) =>
      prev.map((cf) => {
        if (cf.id !== id) return cf;
        let nextVal = cf.value;
        if (nextType === 'number') {
          nextVal = typeof cf.value === 'number' ? cf.value : parseInt(String(cf.value).replace(/\D/g, ''), 10) || 1;
        } else if (nextType === 'checklist') {
          nextVal = normalizeChecklistItems(cf.value);
        } else if (Array.isArray(cf.value)) {
          nextVal = cf.value.map((i) => (typeof i === 'string' ? i : i.text)).join(', ');
        } else {
          nextVal = String(cf.value ?? '');
        }
        return {
          ...cf,
          type: nextType,
          value: nextVal,
          layoutSize:
            nextType === 'longText'
              ? 'full-width'
              : cf.layoutSize,
        };
      })
    );
  };

  // Checklist item operations inside a checklist block
  const handleToggleChecklistItem = (blockId, itemIdx) => {
    setCanvasFields((prev) =>
      prev.map((cf) => {
        if (cf.id !== blockId) return cf;
        const items = normalizeChecklistItems(cf.value);
        const updated = items.map((it, idx) =>
          idx === itemIdx ? { ...it, checked: !it.checked } : it
        );
        return { ...cf, value: updated };
      })
    );
  };

  const handleEditChecklistItemText = (blockId, itemIdx, newText) => {
    setCanvasFields((prev) =>
      prev.map((cf) => {
        if (cf.id !== blockId) return cf;
        const items = normalizeChecklistItems(cf.value);
        const updated = items.map((it, idx) =>
          idx === itemIdx ? { ...it, text: newText } : it
        );
        return { ...cf, value: updated };
      })
    );
  };

  const handleRemoveChecklistItem = (blockId, itemIdx) => {
    setCanvasFields((prev) =>
      prev.map((cf) => {
        if (cf.id !== blockId) return cf;
        const items = normalizeChecklistItems(cf.value);
        return { ...cf, value: items.filter((_, idx) => idx !== itemIdx) };
      })
    );
  };

  const handleAppendChecklistItem = (blockId) => {
    const draftText = (checklistDrafts[blockId] || '').trim();
    if (!draftText) return;
    setCanvasFields((prev) =>
      prev.map((cf) => {
        if (cf.id !== blockId) return cf;
        const items = normalizeChecklistItems(cf.value);
        return {
          ...cf,
          value: [
            ...items,
            { id: `chk-${Date.now()}`, text: draftText, checked: false },
          ],
        };
      })
    );
    setChecklistDrafts((prev) => ({ ...prev, [blockId]: '' }));
  };

  // AI Natural Language Parser
  const handleAiParse = async (promptToUse) => {
    const text = (promptToUse ?? aiPrompt).trim();
    if (!text) return;
    setIsParsingAi(true);
    setAiError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/tasks/parse-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt: text }),
      });

      const limitHdr = res.headers.get('X-RateLimit-Limit-Tokens');
      const remHdr = res.headers.get('X-RateLimit-Remaining-Tokens');
      const usedHdr = res.headers.get('X-RateLimit-Used-Tokens');
      if (limitHdr && remHdr) {
        setTokenQuota((prev) => ({
          ...prev,
          dailyTokenLimit: Number(limitHdr),
          remainingTokens: Number(remHdr),
          tokensUsedToday: usedHdr ? Number(usedHdr) : prev.tokensUsedToday,
        }));
      }

      const parsedBody = await res.json();
      if (!res.ok) {
        setAiError(parsedBody?.error || parsedBody?.message || 'AI request blocked by security policy or token quota.');
        if (parsedBody?.tokenUsage) {
          setTokenQuota(parsedBody.tokenUsage);
        }
        return;
      }

      const parsedArray = parsedBody;
      console.log(JSON.stringify(parsedArray, null, 2));

      if (Array.isArray(parsedArray) && parsedArray.length > 0) {
        const first = parsedArray[0];
        if (first.fixedData) {
          if (first.fixedData.taskName) setTaskName(first.fixedData.taskName);
          if (first.fixedData.day && YMD_TO_DAY_NAME[first.fixedData.day]) {
            setSelectedDayName(YMD_TO_DAY_NAME[first.fixedData.day]);
          }
          if (first.fixedData.startingTime) {
            setStartingTime24(to24HourTime(first.fixedData.startingTime));
          }
          if (first.fixedData.durationMinutes) {
            setDurationDigits(String(first.fixedData.durationMinutes));
          }
          if (first.fixedData.color && PALETTE_COLORS.includes(first.fixedData.color)) {
            setSelectedColor(first.fixedData.color);
          }
        }
        if (Array.isArray(first.canvasFields) && first.canvasFields.length > 0) {
          setCanvasFields(
            first.canvasFields.map((cf, i) => ({
              id: `ai-cf-${Date.now()}-${i}`,
              label: cf.label || `Field ${i + 1}`,
              value:
                cf.type === 'checklist'
                  ? normalizeChecklistItems(cf.value)
                  : cf.type === 'number'
                  ? Number(cf.value) || 0
                  : String(cf.value ?? ''),
              type: cf.type || 'text',
              layoutSize: cf.layoutSize || 'half-width',
              unit:
                cf.label?.toLowerCase().includes('sets')
                  ? 'SETS'
                  : cf.label?.toLowerCase().includes('reps')
                  ? 'REPS'
                  : 'VAL',
              subtitle: `AI Parsed • ${cf.layoutSize}`,
            }))
          );
        }
      }
    } catch (err) {
      console.error('AI Parser Error:', err);
    } finally {
      setIsParsingAi(false);
    }
  };

  // Save Task Handler
  const handleSaveTask = () => {
    const payload = compiledWklyJson[0];
    console.log(JSON.stringify(compiledWklyJson, null, 2));
    setIsCommitting(true);

    const formattedTime12 = to12HourTime(payload.fixedData.startingTime);
    const durationStr = `${payload.fixedData.durationMinutes} min`;

    // Extract goals & notes for compatibility with the rest of the board
    const extractedGoals = [];
    let extractedNotes = '';
    const legacyFields = [];

    canvasFields.forEach((cf) => {
      if (cf.type === 'checklist') {
        const items = normalizeChecklistItems(cf.value);
        items.forEach((it) => {
          if (it.text.trim()) {
            extractedGoals.push({
              id: it.id || Date.now() + Math.random(),
              text: it.text.trim(),
              checked: Boolean(it.checked),
            });
          }
        });
      } else if (cf.type === 'longText') {
        if (String(cf.value).trim()) {
          extractedNotes = String(cf.value).trim();
        }
      } else if (String(cf.value).trim() !== '') {
        legacyFields.push({
          key: cf.label || 'Field',
          value: cf.type === 'number' ? Number(cf.value) || 0 : String(cf.value),
        });
      }
    });

    const summarySubtitle =
      legacyFields.length > 0
        ? legacyFields
            .slice(0, 2)
            .map((f) => `${f.key}: ${f.value}`)
            .join(' · ')
        : sprintTag || `${payload.fixedData.color} • ${durationStr}`;

    setTimeout(() => {
      setIsCommitting(false);
      if (onSave) {
        onSave({
          title: payload.fixedData.taskName,
          taskName: payload.fixedData.taskName,
          category: initialTask?.category || 'OTHER',
          color: payload.fixedData.color,
          date: `${payload.fixedData.day}T${payload.fixedData.startingTime}:00.000Z`,
          day: selectedDayName,
          time: formattedTime12,
          duration: durationStr,
          colorTint: activeColorMeta.tintClass,
          subtitle: summarySubtitle,
          fixedData: payload.fixedData,
          canvasFields: canvasFields,
          fields: legacyFields,
          details: {
            fixedData: payload.fixedData,
            canvasFields: canvasFields,
            fields: legacyFields,
            goals: extractedGoals,
            notes: extractedNotes,
            tag: sprintTag,
            color: payload.fixedData.color,
            isoDate: `${payload.fixedData.day}T${payload.fixedData.startingTime}:00.000Z`,
          },
        });
      }
    }, 220);
  };

  let numericCounter = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-[#121212]/60 dark:bg-black/75 backdrop-blur-[2px] transition-opacity duration-200 font-sans"
      id="canvas-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      {/* Main Modal Shell Frame (Compact, Proportionate Neo-Brutalist Layout) */}
      <div className="relative w-full max-w-3xl max-h-[86vh] flex flex-col bg-[#fffdfa] dark:bg-[#161922] text-[#121212] dark:text-[#F3F4F6] border-[2.5px] border-[#121212] dark:border-[#383F50] shadow-[6px_6px_0_#121212] dark:shadow-[6px_6px_0_#000000] rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors">
        {/* ZONE 1: FIXED HEADER ZONE */}
        <div className="shrink-0 bg-white dark:bg-[#1E232E] border-b-2 border-[#121212] dark:border-[#383F50] px-3.5 md:px-5 py-2.5 flex flex-col gap-2 z-20 transition-colors">
          {/* Top bar: Badge, Live Title, AI Trigger, Dismiss & Primary CTA */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-[260px] flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#fef08a] dark:bg-[#292312] text-[#121212] dark:text-[#FBBF24] border-2 border-[#121212] dark:border-[#FBBF24] font-display text-[10px] font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0_#121212] dark:shadow-[2px_2px_0_#000000] rounded">
                <span className="w-2 h-2 rounded-full bg-[#fd56a7] dark:bg-[#F472B6] inline-block animate-pulse"></span>
                CUSTOM CANVAS V2.4
              </span>
              <span className="text-[#7b7486] dark:text-[#9CA3AF] font-display text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">
                / DUAL-ROLE ENGINE
              </span>

              <button
                type="button"
                onClick={() => setShowAiDrawer((prev) => !prev)}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 border-2 border-[#121212] dark:border-[#A855F7] shadow-[1.5px_1.5px_0_#121212] dark:shadow-[2px_2px_0_#000000] rounded font-display text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  showAiDrawer
                    ? 'bg-[#8455ef] dark:bg-[#A855F7] text-white dark:text-[#0B0D11]'
                    : 'bg-[#f3e8ff] dark:bg-[#2E1850] hover:bg-[#e9ddff] dark:hover:bg-[#3b1f66] text-[#121212] dark:text-[#C084FC]'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                <span>{showAiDrawer ? 'Hide AI Parser' : 'AI Natural Language Parser'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowJsonPreview((prev) => !prev)}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-[#10141C] hover:bg-[#bae6fd] dark:hover:bg-[#132637] text-[#121212] dark:text-[#38BDF8] border-2 border-[#121212] dark:border-[#383F50] dark:hover:border-[#38BDF8] shadow-[1.5px_1.5px_0_#121212] dark:shadow-[2px_2px_0_#000000] rounded font-display text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">code</span>
                <span>{showJsonPreview ? 'Hide JSON' : 'JSON'}</span>
              </button>
            </div>

            {/* Actions: Secondary Dismiss & Solid Primary CTA Button */}
            <div className="flex items-center gap-2">
              {onClose && (
                <button
                  onClick={onClose}
                  className="group flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-[#10141C] hover:bg-[#ffd1dc] dark:hover:bg-[#2A161D] text-[#121212] dark:text-[#F3F4F6] dark:hover:text-[#FB7185] border-2 border-[#121212] dark:border-[#383F50] dark:hover:border-[#FB7185] shadow-[2px_2px_0_#121212] dark:shadow-[2px_2px_0_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all rounded cursor-pointer"
                  id="btn-cancel"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                  <span className="font-display text-[10px] font-bold uppercase tracking-wider">
                    Cancel
                  </span>
                </button>
              )}
              <button
                onClick={handleSaveTask}
                className={`group flex items-center gap-1.5 px-4 py-1.5 border-2 border-[#121212] dark:border-[#C084FC] shadow-[4px_4px_0_#121212] dark:shadow-[4px_4px_0_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#121212] transition-all rounded cursor-pointer ${
                  isCommitting
                    ? 'bg-[#bbf7d0] dark:bg-[#34D399] text-[#121212] dark:text-[#062E1E]'
                    : 'bg-[#8455ef] dark:bg-[#9333EA] hover:bg-[#6b38d4] dark:hover:bg-[#A855F7] text-white'
                }`}
                id="btn-save-task"
                type="button"
              >
                <span
                  className={`material-symbols-outlined text-[18px] ${
                    isCommitting ? 'animate-spin' : ''
                  }`}
                >
                  {isCommitting ? 'sync' : 'save'}
                </span>
                <span className="font-display text-xs font-bold uppercase tracking-wider">
                  {isCommitting ? 'Committed!' : 'Save Task To Board'}
                </span>
              </button>
            </div>
          </div>

          {/* Optional AI Natural Language Parser Drawer */}
          {showAiDrawer && (
            <div className="p-3 bg-[#fffdfa] dark:bg-[#10141C] border-2 border-[#121212] dark:border-[#383F50] shadow-[3px_3px_0_#121212] dark:shadow-[3px_3px_0_#000000] rounded space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-display font-bold uppercase">
                <span className="text-[#494454] dark:text-[#9CA3AF]">
                  AI TASK PARSER • SANITIZED & SCHEMA-LOCKED
                </span>
                <span className="px-2 py-0.5 bg-[#bbf7d0]/70 dark:bg-[#122A21] text-[#121212] dark:text-[#34D399] border border-[#121212] dark:border-[#34D399] rounded">
                  USER TOKEN QUOTA: {tokenQuota.remainingTokens.toLocaleString()} / {tokenQuota.dailyTokenLimit.toLocaleString()} TOKENS LEFT
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  maxLength={1000}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAiParse();
                    }
                  }}
                  placeholder="Describe your task in plain English (e.g. ESP32 sensor calibration on Friday at 4pm for 2 hours...)"
                  className="flex-1 bg-white dark:bg-[#161922] border-2 border-[#121212] dark:border-[#383F50] px-3 py-1.5 text-xs font-medium text-[#121212] dark:text-[#F3F4F6] placeholder:text-[#7b7486] dark:placeholder:text-[#64748B] rounded shadow-[1.5px_1.5px_0_#121212] dark:shadow-[2px_2px_0_#000000] focus:outline-none focus:border-[#6b38d4] dark:focus:border-[#A855F7]"
                />
                <button
                  type="button"
                  disabled={isParsingAi}
                  onClick={() => handleAiParse()}
                  className="px-3.5 py-1.5 bg-[#fef08a] dark:bg-[#292312] hover:bg-[#fde047] dark:hover:bg-[#3b3117] text-[#121212] dark:text-[#FBBF24] border-2 border-[#121212] dark:border-[#FBBF24] shadow-[2px_2px_0_#121212] dark:shadow-[2px_2px_0_#000000] rounded font-display text-[11px] font-bold uppercase cursor-pointer whitespace-nowrap"
                >
                  {isParsingAi ? 'Parsing...' : '⚡ Parse To Canvas'}
                </button>
              </div>
              {aiError && (
                <div className="px-2.5 py-1.5 bg-[#ffd1dc] dark:bg-[#2A161D] border border-[#121212] dark:border-[#FB7185] rounded text-[11px] font-display font-bold text-[#93000a] dark:text-[#FB7185]">
                  {aiError}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-[10px] font-bold uppercase text-[#7b7486] dark:text-[#9CA3AF]">
                  Presets:
                </span>
                {AI_EXAMPLE_PROMPTS.map((ex, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setAiPrompt(ex.prompt);
                      handleAiParse(ex.prompt);
                    }}
                    className="px-2 py-0.5 bg-white dark:bg-[#1E232E] hover:bg-[#bae6fd] dark:hover:bg-[#132637] text-[#121212] dark:text-[#F3F4F6] dark:hover:text-[#38BDF8] border border-[#121212] dark:border-[#383F50] rounded text-[10px] font-display font-bold cursor-pointer transition-colors"
                  >
                    {ex.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Task Title Field: Compact Display Type with Brutalist Underline Emphasis */}
          <div className="relative w-full pt-0.5">
            <input
              aria-label="Task or Drill Name"
              className="w-full bg-transparent font-display text-lg md:text-xl font-bold text-[#121212] dark:text-[#F3F4F6] placeholder:text-[#7b7486]/70 dark:placeholder:text-[#64748B] border-0 border-b-2 border-[#121212] dark:border-[#383F50] focus:border-b-2 focus:border-[#6b38d4] dark:focus:border-[#A855F7] focus:outline-none pb-1 tracking-tight transition-colors"
              id="task-title-input"
              placeholder="Type task or workout protocol name..."
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />
          </div>

          {/* Structured Metadata Pills (fixedData) & 10-Color Swatch Selector Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 relative">
            {/* Metadata input triggers with crisp 2px border and 2.5px offset drop shadows */}
            <div className="flex flex-wrap items-center gap-2">
              {/* 1. Date / Day Pill */}
              <div className="relative">
                <button
                  onClick={() =>
                    setActivePillPopover(activePillPopover === 'date' ? null : 'date')
                  }
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-[#10141C] hover:bg-[#bae6fd]/40 dark:hover:bg-[#161922] border-2 border-[#121212] dark:border-[#383F50] dark:hover:border-[#A855F7] shadow-[2.5px_2.5px_0_#121212] dark:shadow-[2.5px_2.5px_0_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#121212] rounded transition-all text-[#121212] dark:text-[#F3F4F6] cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#6b38d4] dark:text-[#A855F7]">
                    calendar_today
                  </span>
                  <span className="font-display text-[10px] font-bold uppercase tracking-wider">
                    {DAY_SHORT_LABELS[selectedDayName] || selectedDayName}
                  </span>
                </button>

                {activePillPopover === 'date' && (
                  <div className="absolute left-0 top-full mt-1.5 z-30 bg-white dark:bg-[#161922] border-2 border-[#121212] dark:border-[#383F50] shadow-[4px_4px_0_#121212] dark:shadow-[4px_4px_0_#000000] rounded p-1.5 w-48 space-y-1">
                    {Object.keys(DAY_NAME_TO_YMD).map((dayKey) => (
                      <button
                        key={dayKey}
                        type="button"
                        onClick={() => {
                          setSelectedDayName(dayKey);
                          setActivePillPopover(null);
                        }}
                        className={`w-full text-left px-2 py-1 rounded font-display text-[11px] font-bold uppercase flex items-center justify-between cursor-pointer ${
                          selectedDayName === dayKey
                            ? 'bg-[#fef08a] dark:bg-[#2E1850] text-[#121212] dark:text-[#C084FC] border border-[#121212] dark:border-[#A855F7]'
                            : 'hover:bg-[#f6f3f2] dark:hover:bg-[#1E232E] text-[#121212] dark:text-[#F3F4F6]'
                        }`}
                      >
                        <span>{dayKey}</span>
                        <span className="text-[9px] opacity-70">{DAY_NAME_TO_YMD[dayKey]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Start Time Pill (24h HH:MM) */}
              <div className="relative">
                <button
                  onClick={() =>
                    setActivePillPopover(activePillPopover === 'time' ? null : 'time')
                  }
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-[#10141C] hover:bg-[#bbf7d0]/40 dark:hover:bg-[#161922] border-2 border-[#121212] dark:border-[#383F50] dark:hover:border-[#38BDF8] shadow-[2.5px_2.5px_0_#121212] dark:shadow-[2.5px_2.5px_0_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#121212] rounded transition-all text-[#121212] dark:text-[#F3F4F6] cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#006577] dark:text-[#38BDF8]">
                    schedule
                  </span>
                  <span className="font-display text-[10px] font-bold uppercase tracking-wider">
                    {startingTime24} EST ({to12HourTime(startingTime24)})
                  </span>
                </button>

                {activePillPopover === 'time' && (
                  <div className="absolute left-0 top-full mt-1.5 z-30 bg-white dark:bg-[#161922] border-2 border-[#121212] dark:border-[#383F50] shadow-[4px_4px_0_#121212] dark:shadow-[4px_4px_0_#000000] rounded p-3 w-64 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-[10px] font-bold uppercase text-[#121212] dark:text-[#F3F4F6]">
                        Starting Time (24h)
                      </span>
                      <button
                        type="button"
                        onClick={() => setActivePillPopover(null)}
                        className="text-[10px] font-display font-bold px-1.5 py-0.5 bg-[#bbf7d0] dark:bg-[#122A21] text-[#121212] dark:text-[#34D399] border border-[#121212] dark:border-[#34D399] rounded cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                    <input
                      type="time"
                      value={startingTime24}
                      onChange={(e) => setStartingTime24(e.target.value || '14:00')}
                      className="w-full px-2.5 py-1.5 bg-[#f6f3f2] dark:bg-[#10141C] border-2 border-[#121212] dark:border-[#383F50] rounded font-mono text-sm font-bold text-[#121212] dark:text-[#F3F4F6]"
                    />
                    <div className="grid grid-cols-3 gap-1">
                      {['07:00', '09:00', '12:00', '14:00', '16:00', '20:00'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setStartingTime24(preset);
                            setActivePillPopover(null);
                          }}
                          className={`px-1.5 py-1 rounded border border-[#121212] dark:border-[#383F50] font-mono text-[10px] font-bold cursor-pointer ${
                            startingTime24 === preset
                              ? 'bg-[#8455ef] dark:bg-[#A855F7] text-white dark:text-[#0B0D11]'
                              : 'bg-[#fffdfa] dark:bg-[#1E232E] text-[#121212] dark:text-[#F3F4F6] hover:bg-[#fef08a] dark:hover:bg-[#2E1850]'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Duration Pill (Numbers Only Input!) */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-[#10141C] hover:bg-[#fef08a]/40 dark:hover:bg-[#161922] border-2 border-[#121212] dark:border-[#383F50] dark:hover:border-[#FBBF24] shadow-[2.5px_2.5px_0_#121212] dark:shadow-[2.5px_2.5px_0_#000000] rounded transition-all text-[#121212] dark:text-[#F3F4F6]">
                <span className="material-symbols-outlined text-[16px] text-[#b4136e] dark:text-[#F472B6]">
                  timer
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  aria-label="Duration in minutes"
                  value={durationDigits}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  onBlur={handleDurationBlur}
                  onKeyDown={(e) => {
                    const allowed = [
                      'Backspace',
                      'Delete',
                      'ArrowLeft',
                      'ArrowRight',
                      'Tab',
                      'Enter',
                      'Home',
                      'End',
                    ];
                    if (
                      !allowed.includes(e.key) &&
                      !e.ctrlKey &&
                      !e.metaKey &&
                      !/^[0-9]$/.test(e.key)
                    ) {
                      e.preventDefault();
                    }
                  }}
                  className="w-10 bg-transparent font-display text-[11px] font-bold uppercase text-center text-[#121212] dark:text-[#F3F4F6] focus:outline-none border-b border-dashed border-[#121212]/40 dark:border-[#9CA3AF]/50"
                />
                <span className="font-display text-[10px] font-bold uppercase tracking-wider">
                  Mins
                </span>
              </div>

              {/* 4. Tag / Sprint Pill */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#bbf7d0]/60 dark:bg-[#122A21] hover:bg-[#bbf7d0] dark:hover:bg-[#0A291E] border-2 border-[#121212] dark:border-[#34D399] shadow-[2.5px_2.5px_0_#121212] dark:shadow-[2.5px_2.5px_0_#000000] rounded transition-all text-[#121212] dark:text-[#34D399]">
                <span className="material-symbols-outlined text-[16px] text-[#121212] dark:text-[#34D399]">
                  bolt
                </span>
                <input
                  type="text"
                  value={sprintTag}
                  onChange={(e) => setSprintTag(e.target.value)}
                  className="bg-transparent font-display text-[10px] font-bold uppercase tracking-wider text-[#121212] dark:text-[#34D399] focus:outline-none w-36 sm:w-44"
                />
              </div>
            </div>

            {/* 10 Circular Pastel Dopamine Swatch Pickers */}
            <div className="flex items-center gap-1.5 p-1 bg-[#ebe7e7] dark:bg-[#10141C] border-2 border-[#121212] dark:border-[#383F50] shadow-[2px_2px_0_#121212] dark:shadow-[2px_2px_0_#000000] rounded-full">
              <span className="font-display text-[10px] font-bold text-[#121212] dark:text-[#9CA3AF] px-1.5 uppercase hidden lg:inline">
                SWATCH:
              </span>
              {PALETTE_COLORS.map((colorName) => {
                const swatch = COLOR_HEX_MAP[colorName];
                const isActive = selectedColor === colorName;
                return (
                  <button
                    key={colorName}
                    type="button"
                    title={colorName}
                    onClick={() => setSelectedColor(colorName)}
                    style={{ backgroundColor: swatch.pastel }}
                    className={`w-5 h-5 rounded-full border-2 border-[#121212] transition-transform relative focus:outline-none cursor-pointer flex items-center justify-center ${
                      isActive
                        ? 'border-[2.5px] ring-2 ring-[#121212] dark:ring-[#A855F7] ring-offset-1 dark:ring-offset-[#10141C] scale-110'
                        : 'hover:scale-110'
                    }`}
                  >
                    {isActive && (
                      <span className="w-1.5 h-1.5 bg-[#121212] rounded-full inline-block" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ZONE 2: FLEXIBLE CANVAS WORKSPACE (MIDDLE) */}
        <div
          ref={canvasScrollRef}
          className={`flex-1 overflow-y-auto p-3.5 md:p-4 flex flex-col gap-3 relative min-h-[240px] canvas-dot-grid scrollbar-custom transition-colors ${
            mouseDrag?.mode === 'palette'
              ? 'ring-4 ring-inset ring-[#8455ef] dark:ring-[#A855F7]'
              : ''
          }`}
          id="canvas-scroll-container"
        >
          {/* Canvas Workspace Guidance Banner */}
          <div className="flex items-center justify-between bg-white/95 dark:bg-[#161922]/95 border-2 border-[#121212] dark:border-[#383F50] shadow-[2px_2px_0_#121212] dark:shadow-[3px_3px_0_#000000] px-4 py-1.5 rounded transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#6b38d4] dark:bg-[#A855F7] rounded-none border border-[#121212] dark:border-white rotate-45 inline-block"></span>
              <span className="font-display text-[10px] font-bold uppercase text-[#121212] dark:text-[#F3F4F6] tracking-wider">
                CANVAS WORKSPACE • GRAB ANY BLOCK TO MOVE • CLICK HALF/FULL TO RESIZE
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[#7b7486] dark:text-[#9CA3AF] font-display text-[10px] font-bold">
              {mouseDrag && (
                <span className="px-2 py-0.5 bg-[#fef08a] dark:bg-[#2E1850] text-[#121212] dark:text-[#C084FC] border border-[#121212] dark:border-[#A855F7] rounded animate-pulse">
                  MOVING BLOCK...
                </span>
              )}
              <span>{canvasFields.length} BLOCKS</span>
            </div>
          </div>

          {/* Live Wkly JSON Schema Output Inspector (Optional Toggle) */}
          {showJsonPreview && (
            <div className="bg-[#121212] dark:bg-[#10141C] text-[#bbf7d0] dark:text-[#34D399] border-2 border-[#121212] dark:border-[#383F50] shadow-[4px_4px_0_#121212] dark:shadow-[4px_4px_0_#000000] rounded p-3 font-mono text-xs overflow-x-auto">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/20 dark:border-[#383F50] text-[10px] font-display uppercase text-[#fef08a] dark:text-[#FBBF24]">
                <span>STRICT WKLY JSON OUTPUT (fixedData + canvasFields)</span>
                <span>2026 SCHEMA</span>
              </div>
              <pre>{JSON.stringify(compiledWklyJson, null, 2)}</pre>
            </div>
          )}

          {/* CANVAS CONTENT 12-COL GRID */}
          {canvasFields.length === 0 ? (
            <div className="p-10 bg-white/95 dark:bg-[#161922]/95 border-[2.5px] border-dashed border-[#121212] dark:border-[#383F50] rounded shadow-[4px_4px_0_#121212] dark:shadow-[4px_4px_0_#000000] text-center space-y-2">
              <p className="font-display text-sm font-bold uppercase text-[#121212] dark:text-[#F3F4F6]">
                Canvas is empty — Drop or Click Blocks Below
              </p>
              <p className="text-xs text-[#494454] dark:text-[#9CA3AF]">
                Drag any block from the bottom dock directly onto the canvas, or click to stack it.
              </p>
            </div>
          ) : (
            <div
              ref={canvasGridRef}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full select-none"
            >
              {canvasFields.map((cf, idx) => {
                const isHalf = cf.layoutSize === 'half-width';
                const colSpanClass = isHalf ? 'md:col-span-6' : 'md:col-span-12';
                const isSelected = activeBlockId === cf.id;
                const isBeingDragged =
                  mouseDrag?.mode === 'block' && mouseDrag.blockId === cf.id;
                const isBeingResized = resizingBlockId === cf.id;

                if (cf.type === 'number') {
                  numericCounter += 1;
                }

                // When this block is actively being dragged by mouse, render a live Drop Target Slot in the grid
                if (isBeingDragged) {
                  return (
                    <div
                      key={cf.id || idx}
                      data-canvas-block-id={cf.id}
                      style={{ minHeight: mouseDrag.height || 140 }}
                      className={`${colSpanClass} rounded border-[3px] border-dashed border-[#8455ef] dark:border-[#A855F7] bg-[#f3e8ff]/45 dark:bg-[#2E1850]/35 flex flex-col items-center justify-center gap-1.5 p-4 transition-all`}
                    >
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-[#fef08a] dark:bg-[#1E232E] border-2 border-[#121212] dark:border-[#A855F7] shadow-[2px_2px_0_#121212] rounded font-display text-[10px] font-bold uppercase text-[#121212] dark:text-[#C084FC]">
                        <span className="material-symbols-outlined text-[15px]">
                          place_item
                        </span>
                        <span>
                          DROP HERE • SLOT #{idx + 1} ({cf.layoutSize})
                        </span>
                      </div>
                      <span className="font-display text-[10px] font-bold uppercase text-[#6b38d4] dark:text-[#9CA3AF]">
                        {cf.label || 'Untitled Block'}
                      </span>
                    </div>
                  );
                }

                const dragStateClasses = isBeingResized
                  ? 'ring-2 ring-[#38bdf8]'
                  : isSelected
                  ? 'ring-2 ring-[#6b38d4] dark:ring-[#A855F7] ring-offset-2 dark:ring-offset-[#0B0D11]'
                  : '';

                // Flush Right-Edge Mouse Resize Zone (stays strictly inside the block border, never sticks out)
                const resizeEdgeHandle = (
                  <div
                    data-no-drag="true"
                    onMouseDown={(e) => handleStartResizeBlock(e, cf.id)}
                    title="Drag right edge to resize between Half and Full width"
                    className="hidden md:block absolute top-0 bottom-0 right-0 w-2 cursor-ew-resize z-10 hover:bg-[#8455ef]/30 dark:hover:bg-[#A855F7]/30 transition-colors"
                  />
                );

                // Single Tactile Drag Grip Icon inside the Block Header
                const inlineDragGrip = (
                  <div
                    onMouseDown={(e) => handleBlockPointerDown(e, cf.id, true)}
                    title="Drag to move block"
                    className="flex items-center justify-center p-1 -ml-1 rounded cursor-grab active:cursor-grabbing text-[#494454] dark:text-[#9CA3AF] hover:text-[#121212] dark:hover:text-[#F3F4F6] hover:bg-[#fef08a] dark:hover:bg-[#2E1850] transition-colors shrink-0 select-none"
                  >
                    <span className="material-symbols-outlined text-[17px] leading-none">
                      drag_indicator
                    </span>
                  </div>
                );

                // Integrated Controls Inside Block Header (Half/Full toggle, Type switcher, Remove)
                const headerControls = (
                  <div
                    data-no-drag="true"
                    className="flex items-center gap-1 shrink-0 select-none"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLayoutSize(cf.id);
                      }}
                      title="Toggle Half-Width (50%) / Full-Width (100%)"
                      className="flex items-center gap-1 px-1.5 py-0.5 bg-[#f6f3f2] dark:bg-[#1E232E] hover:bg-[#fef08a] dark:hover:bg-[#2E1850] text-[#121212] dark:text-[#F3F4F6] border border-[#121212] dark:border-[#383F50] rounded font-display text-[10px] font-bold uppercase transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[13px] leading-none">
                        {isHalf ? 'width_normal' : 'width_full'}
                      </span>
                      <span>{isHalf ? 'Half' : 'Full'}</span>
                    </button>

                    <select
                      value={cf.type}
                      onChange={(e) => handleSwitchBlockType(cf.id, e.target.value)}
                      aria-label="Block type"
                      className="px-1.5 py-0.5 bg-[#f6f3f2] dark:bg-[#1E232E] hover:bg-[#bae6fd]/50 dark:hover:bg-[#2E1850] text-[#121212] dark:text-[#F3F4F6] border border-[#121212] dark:border-[#383F50] rounded font-display text-[10px] font-bold uppercase focus:outline-none cursor-pointer transition-colors"
                    >
                      <option value="number" className="bg-white dark:bg-[#1E232E] text-[#121212] dark:text-[#F3F4F6]">Number</option>
                      <option value="text" className="bg-white dark:bg-[#1E232E] text-[#121212] dark:text-[#F3F4F6]">Text</option>
                      <option value="checklist" className="bg-white dark:bg-[#1E232E] text-[#121212] dark:text-[#F3F4F6]">Checklist</option>
                      <option value="longText" className="bg-white dark:bg-[#1E232E] text-[#121212] dark:text-[#F3F4F6]">Notes</option>
                    </select>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveBlock(cf.id);
                      }}
                      title="Remove block"
                      className="p-0.5 bg-[#f6f3f2] dark:bg-[#1E232E] hover:bg-[#ffd1dc] dark:hover:bg-[#2A161D] text-[#ba1a1a] dark:text-[#FB7185] border border-[#121212] dark:border-[#383F50] rounded flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px] leading-none">
                        close
                      </span>
                    </button>
                  </div>
                );

                // Common Pointer Drag Props for every block wrapper
                const blockDragProps = {
                  'data-canvas-block-id': cf.id,
                  onMouseDown: (e) => handleBlockPointerDown(e, cf.id, false),
                };

                // 1. NUMBER BLOCK (Compact Number / Sets / Reps / Sensor Rate with Stepper)
                if (cf.type === 'number') {
                  const numBadge = `#0${numericCounter}`;
                  const numVal = Number(cf.value) || 0;
                  const unitLabel =
                    cf.unit ||
                    (cf.label.toLowerCase().includes('set')
                      ? 'SETS'
                      : cf.label.toLowerCase().includes('rep')
                      ? 'REPS'
                      : 'VAL');

                  return (
                    <div
                      key={cf.id || idx}
                      {...blockDragProps}
                      onClick={() => setActiveBlockId(cf.id)}
                      className={`${colSpanClass} group relative bg-white dark:bg-[#161922] border-[2.5px] border-[#121212] dark:border-[#383F50] shadow-[4px_4px_0_#121212] dark:shadow-[4px_4px_0_#000000] rounded p-4 flex flex-col justify-between transition-all hover:shadow-[5px_5px_0_#121212] dark:hover:shadow-[5px_5px_0_#000000] cursor-grab active:cursor-grabbing ${dragStateClasses}`}
                    >
                      {resizeEdgeHandle}

                      <div className="flex items-center justify-between pb-2 border-b-2 border-[#121212]/10 dark:border-[#383F50] gap-2">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          {inlineDragGrip}
                          <span
                            className={`px-1.5 py-0.5 border border-[#121212] dark:border-[#A855F7] font-display text-[10px] font-bold shrink-0 ${
                              numericCounter % 2 === 0
                                ? 'bg-[#8455ef] dark:bg-[#2E1850] text-white dark:text-[#C084FC]'
                                : 'bg-[#fef08a] dark:bg-[#292312] text-[#121212] dark:text-[#FBBF24] dark:border-[#FBBF24]'
                            }`}
                          >
                            {numBadge}
                          </span>
                          <input
                            type="text"
                            value={cf.label}
                            onChange={(e) =>
                              handleUpdateBlock(cf.id, { label: e.target.value })
                            }
                            placeholder="Field Label..."
                            className="font-display text-xs font-bold uppercase text-[#121212] dark:text-[#F3F4F6] bg-transparent border-b border-transparent focus:border-[#121212] dark:focus:border-[#A855F7] focus:outline-none flex-1 min-w-0 cursor-text"
                          />
                        </div>
                        {headerControls}
                      </div>

                      {/* Main Value & Stepper Row */}
                      <div className="flex items-center justify-between py-3 gap-4">
                        <div className="flex flex-col flex-1">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={String(cf.value)}
                            onKeyDown={(e) => {
                              const allowed = [
                                'Backspace',
                                'Delete',
                                'ArrowLeft',
                                'ArrowRight',
                                'Tab',
                                'Enter',
                              ];
                              if (
                                !allowed.includes(e.key) &&
                                !e.ctrlKey &&
                                !e.metaKey &&
                                !/^[0-9]$/.test(e.key)
                              ) {
                                e.preventDefault();
                              }
                            }}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, '');
                              handleUpdateBlock(cf.id, {
                                value: digits === '' ? 0 : parseInt(digits, 10),
                              });
                            }}
                            className="font-display text-3xl md:text-4xl font-bold text-[#121212] dark:text-[#F3F4F6] tracking-tight leading-none bg-transparent focus:outline-none w-full cursor-text"
                          />
                          <input
                            type="text"
                            value={cf.subtitle || 'Numeric Metric • Click to edit'}
                            onChange={(e) =>
                              handleUpdateBlock(cf.id, { subtitle: e.target.value })
                            }
                            className="text-xs font-medium text-[#494454] dark:text-[#9CA3AF] mt-1 bg-transparent focus:outline-none cursor-text"
                          />
                        </div>

                        {/* Minus / Plus Tactile Stepper Box */}
                        <div className="flex items-center border-2 border-[#121212] dark:border-[#383F50] shadow-[2px_2px_0_#121212] dark:shadow-[2px_2px_0_#000000] bg-[#f6f3f2] dark:bg-[#10141C] rounded overflow-hidden shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateBlock(cf.id, {
                                value: Math.max(0, numVal - 1),
                              })
                            }
                            className="w-10 h-10 flex items-center justify-center bg-white dark:bg-[#1E232E] hover:bg-[#ffd1dc] dark:hover:bg-[#2A161D] text-[#121212] dark:text-[#F3F4F6] dark:hover:text-[#FB7185] border-r-2 border-[#121212] dark:border-[#383F50] active:translate-y-0.5 transition-colors font-display text-lg font-bold cursor-pointer"
                            title="Decrease Value"
                          >
                            -
                          </button>
                          <span className="px-3 font-display text-xs font-bold text-[#121212] dark:text-[#F3F4F6] uppercase">
                            {numVal} {unitLabel}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateBlock(cf.id, {
                                value: numVal + 1,
                              })
                            }
                            className="w-10 h-10 flex items-center justify-center bg-white dark:bg-[#1E232E] hover:bg-[#bbf7d0] dark:hover:bg-[#122A21] text-[#121212] dark:text-[#F3F4F6] dark:hover:text-[#34D399] border-l-2 border-[#121212] dark:border-[#383F50] active:translate-y-0.5 transition-colors font-display text-lg font-bold cursor-pointer"
                            title="Increase Value"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="pt-1.5 border-t-2 border-[#121212]/10 dark:border-[#383F50] flex items-center justify-between text-[#7b7486] dark:text-[#9CA3AF] font-display text-[10px] font-bold uppercase">
                        <span>TYPE: NUMBER</span>
                        <span className="text-[#b4136e] dark:text-[#F472B6]">ACTIVE METRIC</span>
                      </div>
                    </div>
                  );
                }

                // 2. SHORT TEXT / PROPERTY BLOCK
                if (cf.type === 'text') {
                  return (
                    <div
                      key={cf.id || idx}
                      {...blockDragProps}
                      onClick={() => setActiveBlockId(cf.id)}
                      className={`${colSpanClass} group relative bg-white dark:bg-[#161922] border-[2.5px] border-[#121212] dark:border-[#383F50] shadow-[4px_4px_0_#121212] dark:shadow-[4px_4px_0_#000000] rounded p-4 flex flex-col justify-between transition-all hover:shadow-[5px_5px_0_#121212] dark:hover:shadow-[5px_5px_0_#000000] cursor-grab active:cursor-grabbing ${dragStateClasses}`}
                    >
                      {resizeEdgeHandle}

                      <div>
                        <div className="flex items-center justify-between pb-2 border-b-2 border-[#121212]/10 dark:border-[#383F50] gap-2">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            {inlineDragGrip}
                            <span className="material-symbols-outlined text-[16px] text-[#006577] dark:text-[#38BDF8] shrink-0">
                              hub
                            </span>
                            <input
                              type="text"
                              value={cf.label}
                              onChange={(e) =>
                                handleUpdateBlock(cf.id, { label: e.target.value })
                              }
                              placeholder="Property Label (e.g. Project, Hardware)..."
                              className="font-display text-xs font-bold uppercase text-[#121212] dark:text-[#F3F4F6] bg-transparent border-b border-transparent focus:border-[#121212] dark:focus:border-[#A855F7] focus:outline-none flex-1 min-w-0 cursor-text"
                            />
                          </div>
                          {headerControls}
                        </div>

                        <div className="mt-3 flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-[#494454] dark:text-[#9CA3AF]">Value:</span>
                            <input
                              type="text"
                              value={String(cf.value ?? '')}
                              onChange={(e) =>
                                handleUpdateBlock(cf.id, { value: e.target.value })
                              }
                              placeholder={`Enter ${cf.label || 'property'} value...`}
                              className="flex-1 px-2.5 py-1.5 bg-[#fef08a] dark:bg-[#10141C] border-2 border-[#121212] dark:border-[#383F50] font-display text-xs font-bold text-[#121212] dark:text-[#F3F4F6] placeholder:text-[#7b7486] dark:placeholder:text-[#64748B] rounded shadow-[1.5px_1.5px_0_#121212] dark:shadow-[2px_2px_0_#000000] focus:outline-none focus:bg-white dark:focus:bg-[#1E232E] dark:focus:border-[#A855F7] cursor-text"
                            />
                          </div>

                          {/* Visual Biometric / Progress Accent Bar */}
                          <div className="mt-1 flex flex-col gap-1">
                            <div className="flex justify-between items-center text-[10px] font-display font-bold">
                              <span className="uppercase text-[#121212] dark:text-[#9CA3AF]">
                                {cf.subtitle || 'Property Coupling Index'}
                              </span>
                              <span className="text-[#b4136e] dark:text-[#34D399]">VERIFIED</span>
                            </div>
                            <div className="w-full h-3.5 bg-white dark:bg-[#10141C] border-2 border-[#121212] dark:border-[#383F50] rounded overflow-hidden flex">
                              <div className="h-full bg-[#bbf7d0] dark:bg-[#34D399] w-[40%] border-r-2 border-[#121212] dark:border-[#0B0D11]"></div>
                              <div className="h-full bg-[#fef08a] dark:bg-[#FBBF24] w-[35%] border-r-2 border-[#121212] dark:border-[#0B0D11]"></div>
                              <div className="h-full bg-[#fd56a7] dark:bg-[#A855F7] w-[25%]"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-1.5 border-t-2 border-[#121212]/10 dark:border-[#383F50] flex items-center justify-between font-display text-[10px] font-bold text-[#7b7486] dark:text-[#9CA3AF] uppercase">
                        <span>PROPERTY FIELD</span>
                        <span className="text-[#121212] dark:text-[#F3F4F6]">SYNCED</span>
                      </div>
                    </div>
                  );
                }

                // 3. CHECKLIST BLOCK (Diagnostic / Drill Checklist with Interactive States & Sub-Item Dragging)
                if (cf.type === 'checklist') {
                  const items = normalizeChecklistItems(cf.value);
                  const completedCount = items.filter((i) => i.checked).length;

                  return (
                    <div
                      key={cf.id || idx}
                      {...blockDragProps}
                      onClick={() => setActiveBlockId(cf.id)}
                      className={`${colSpanClass} group relative bg-white dark:bg-[#161922] border-[2.5px] border-[#121212] dark:border-[#383F50] shadow-[4px_4px_0_#121212] dark:shadow-[4px_4px_0_#000000] rounded p-4 flex flex-col justify-between transition-all hover:shadow-[5px_5px_0_#121212] dark:hover:shadow-[5px_5px_0_#000000] cursor-grab active:cursor-grabbing ${dragStateClasses}`}
                    >
                      {resizeEdgeHandle}

                      <div>
                        <div className="flex items-center justify-between pb-2 border-b-2 border-[#121212]/10 dark:border-[#383F50] gap-2">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            {inlineDragGrip}
                            <span className="material-symbols-outlined text-[18px] text-[#6b38d4] dark:text-[#A855F7] shrink-0">
                              checklist
                            </span>
                            <input
                              type="text"
                              value={cf.label}
                              onChange={(e) =>
                                handleUpdateBlock(cf.id, { label: e.target.value })
                              }
                              className="font-display text-xs font-bold uppercase text-[#121212] dark:text-[#F3F4F6] bg-transparent border-b border-transparent focus:border-[#121212] dark:focus:border-[#A855F7] focus:outline-none flex-1 min-w-0 cursor-text"
                            />
                            <span
                              className={`font-display text-[10px] font-bold border border-[#121212] px-1.5 py-0.5 shrink-0 ${
                                completedCount === items.length && items.length > 0
                                  ? 'bg-[#bbf7d0] dark:bg-[#122A21] text-[#121212] dark:text-[#34D399] dark:border-[#34D399]'
                                  : 'bg-[#fef08a] dark:bg-[#292312] text-[#121212] dark:text-[#FBBF24] dark:border-[#FBBF24]'
                              }`}
                            >
                              {completedCount}/{items.length} DONE
                            </span>
                          </div>
                          {headerControls}
                        </div>

                        {/* Interactive neo-brutalist checklist items (Draggable by mouse!) */}
                        <div className="mt-2.5 flex flex-col gap-2">
                          {items.map((item, itemIdx) => {
                            const isSubDragged =
                              draggedChecklistItem?.blockId === cf.id &&
                              draggedChecklistItem?.itemIdx === itemIdx;
                            return (
                              <div
                                key={item.id || itemIdx}
                                data-checklist-block={cf.id}
                                data-no-drag="true"
                                className={`flex items-center gap-2 p-2 border-2 border-[#121212] dark:border-[#383F50] rounded transition-all shadow-[2px_2px_0_#121212] dark:shadow-[2px_2px_0_#000000] ${
                                  isSubDragged
                                    ? 'bg-[#f3e8ff] dark:bg-[#2E1850] border-dashed !border-[#8455ef] dark:!border-[#A855F7] scale-[1.01]'
                                    : item.checked
                                    ? 'bg-[#f6f3f2] dark:bg-[#10141C] hover:bg-[#bbf7d0]/20 dark:hover:border-[#34D399]'
                                    : 'bg-white dark:bg-[#1E232E] hover:bg-[#fef08a]/20 dark:hover:border-[#A855F7]'
                                }`}
                              >
                                <span
                                  onMouseDown={(e) =>
                                    handleChecklistMouseDown(e, cf.id, itemIdx)
                                  }
                                  title="Grab and drag checklist item up/down"
                                  className="material-symbols-outlined text-[16px] text-[#7b7486] dark:text-[#9CA3AF] hover:text-[#121212] dark:hover:text-[#F3F4F6] cursor-grab active:cursor-grabbing select-none shrink-0 p-0.5 rounded hover:bg-[#fef08a]/60 dark:hover:bg-[#2E1850]"
                                >
                                  drag_indicator
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleToggleChecklistItem(cf.id, itemIdx)}
                                  className={`w-5 h-5 shrink-0 border-2 border-[#121212] dark:border-[#383F50] flex items-center justify-center shadow-[1px_1px_0_#121212] cursor-pointer ${
                                    item.checked
                                      ? 'bg-[#bbf7d0] dark:bg-[#34D399] dark:border-[#34D399]'
                                      : 'bg-white dark:bg-[#10141C]'
                                  }`}
                                >
                                  <span
                                    className={`material-symbols-outlined text-[#121212] dark:text-[#062E1E] text-[16px] font-bold ${
                                      item.checked ? 'opacity-100' : 'opacity-0'
                                    }`}
                                  >
                                    check
                                  </span>
                                </button>

                                <input
                                  type="text"
                                  value={item.text}
                                  onChange={(e) =>
                                    handleEditChecklistItemText(cf.id, itemIdx, e.target.value)
                                  }
                                  className={`flex-1 bg-transparent text-xs font-medium text-[#121212] dark:text-[#F3F4F6] focus:outline-none cursor-text ${
                                    item.checked
                                      ? 'line-through opacity-75 dark:text-[#9CA3AF]'
                                      : 'font-semibold'
                                  }`}
                                />

                                <button
                                  type="button"
                                  onClick={() => handleRemoveChecklistItem(cf.id, itemIdx)}
                                  className="text-[#7b7486] dark:text-[#9CA3AF] hover:text-[#ba1a1a] dark:hover:text-[#FB7185] text-xs font-bold px-1 cursor-pointer"
                                  title="Remove checklist item"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Quick Append Row */}
                      <div className="mt-3 flex items-center gap-1.5" data-no-drag="true">
                        <input
                          type="text"
                          value={checklistDrafts[cf.id] || ''}
                          onChange={(e) =>
                            setChecklistDrafts((prev) => ({
                              ...prev,
                              [cf.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAppendChecklistItem(cf.id);
                            }
                          }}
                          placeholder="+ Add new execution checklist item..."
                          className="flex-1 bg-white dark:bg-[#10141C] border-2 border-[#121212] dark:border-[#383F50] px-2.5 py-1 text-xs font-medium text-[#121212] dark:text-[#F3F4F6] placeholder:text-[#7b7486]/70 dark:placeholder:text-[#64748B] focus:outline-none focus:border-[#6b38d4] dark:focus:border-[#A855F7] shadow-[1.5px_1.5px_0_#121212] dark:shadow-[2px_2px_0_#000000] rounded cursor-text"
                        />
                        <button
                          type="button"
                          onClick={() => handleAppendChecklistItem(cf.id)}
                          className="px-2.5 py-1 bg-[#fef08a] dark:bg-[#292312] hover:bg-[#fef08a]/80 dark:hover:bg-[#3b3117] border-2 border-[#121212] dark:border-[#FBBF24] font-display text-[10px] font-bold text-[#121212] dark:text-[#FBBF24] uppercase shadow-[1.5px_1.5px_0_#121212] dark:shadow-[2px_2px_0_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none rounded cursor-pointer"
                        >
                          Append
                        </button>
                      </div>
                    </div>
                  );
                }

                // 4. LONG TEXT / NOTES & PROTOCOL SPECIFICATION BLOCK
                return (
                  <div
                    key={cf.id || idx}
                    {...blockDragProps}
                    onClick={() => setActiveBlockId(cf.id)}
                    className={`${colSpanClass} group relative bg-white dark:bg-[#161922] border-[2.5px] border-[#121212] dark:border-[#383F50] shadow-[4px_4px_0_#121212] dark:shadow-[4px_4px_0_#000000] rounded p-4 flex flex-col gap-2.5 transition-all hover:shadow-[5px_5px_0_#121212] dark:hover:shadow-[5px_5px_0_#000000] cursor-grab active:cursor-grabbing ${dragStateClasses}`}
                  >
                    {resizeEdgeHandle}

                    <div className="flex items-center justify-between pb-2 border-b-2 border-[#121212]/10 dark:border-[#383F50] gap-2">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {inlineDragGrip}
                        <span className="material-symbols-outlined text-[18px] text-[#121212] dark:text-[#F3F4F6] shrink-0">
                          notes
                        </span>
                        <input
                          type="text"
                          value={cf.label}
                          onChange={(e) =>
                            handleUpdateBlock(cf.id, { label: e.target.value })
                          }
                          className="font-display text-xs font-bold uppercase text-[#121212] dark:text-[#F3F4F6] bg-transparent border-b border-transparent focus:border-[#121212] dark:focus:border-[#A855F7] focus:outline-none flex-1 min-w-0 cursor-text"
                        />
                      </div>
                      {headerControls}
                    </div>

                    {/* Markdown Text Surface */}
                    <div className="relative w-full" data-no-drag="true">
                      <textarea
                        rows={3}
                        value={String(cf.value ?? '')}
                        onChange={(e) =>
                          handleUpdateBlock(cf.id, { value: e.target.value })
                        }
                        placeholder="Write specific testing procedures, warm-up pacing, or sensor calibration caveats..."
                        className="w-full p-2.5 bg-[#f6f3f2] dark:bg-[#10141C] border-2 border-[#121212] dark:border-[#383F50] rounded text-xs font-medium text-[#121212] dark:text-[#F3F4F6] placeholder:text-[#7b7486] dark:placeholder:text-[#64748B] focus:outline-none focus:border-[#6b38d4] dark:focus:border-[#A855F7] focus:bg-white dark:focus:bg-[#1E232E] shadow-[2px_2px_0_#121212] dark:shadow-[2px_2px_0_#000000] leading-relaxed resize-none transition-colors cursor-text"
                      />
                    </div>

                    {/* Context Footer Tags */}
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-display font-bold">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[#7b7486] dark:text-[#9CA3AF] uppercase">Referenced Docs:</span>
                        <span className="bg-[#ffd1dc]/60 dark:bg-[#2A161D] border border-[#121212] dark:border-[#FB7185] px-1.5 py-0.5 rounded text-[#121212] dark:text-[#FB7185]">
                          NCAA_REG_2026.PDF
                        </span>
                        <span className="bg-[#bae6fd]/60 dark:bg-[#132637] border border-[#121212] dark:border-[#38BDF8] px-1.5 py-0.5 rounded text-[#121212] dark:text-[#38BDF8]">
                          ESP32_PINMAP_V3.SCH
                        </span>
                      </div>
                      <span className="text-[#121212] dark:text-[#9CA3AF] uppercase">
                        SYNCED WITH WKLY BIOMETRICS LOG
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FLOATING 60FPS MOUSE DRAG OVERLAY (FOLLOWS CURSOR DIRECTLY) */}
        {mouseDrag && (
          <div
            style={{
              position: 'fixed',
              left: mouseDrag.clientX - mouseDrag.offsetX,
              top: mouseDrag.clientY - mouseDrag.offsetY,
              width: mouseDrag.width,
              zIndex: 9999,
              pointerEvents: 'none',
            }}
            className="transition-none select-none"
          >
            {mouseDrag.mode === 'palette' ? (
              <div className="px-4 py-2 bg-[#fef08a] dark:bg-[#2E1850] text-[#121212] dark:text-[#F3F4F6] border-[2.5px] border-[#121212] dark:border-[#A855F7] shadow-[6px_6px_0_#121212] dark:shadow-[6px_6px_0_#000000] rounded font-display text-xs font-bold uppercase flex items-center gap-2 rotate-2 scale-105">
                <span className="material-symbols-outlined text-[16px]">add_box</span>
                <span>Drop {mouseDrag.paletteItem?.labelText} on Canvas</span>
              </div>
            ) : (
              (() => {
                const draggedBlock = canvasFields.find(
                  (cf) => cf.id === mouseDrag.blockId
                );
                if (!draggedBlock) return null;
                const slotIdx = canvasFields.findIndex(
                  (cf) => cf.id === mouseDrag.blockId
                );
                return (
                  <div className="bg-white dark:bg-[#161922] border-[3px] border-[#8455ef] dark:border-[#A855F7] shadow-[10px_10px_0_#121212] dark:shadow-[10px_10px_0_#000000] rounded p-4 rotate-[1.2deg] scale-[1.02] opacity-95">
                    <div className="-mx-4 -mt-4 mb-2.5 px-3 py-1.5 bg-[#8455ef] dark:bg-[#A855F7] text-white dark:text-[#0B0D11] flex items-center justify-between font-display text-[10px] font-bold uppercase">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px]">
                          drag_pan
                        </span>
                        <span>MOVING BLOCK • SLOT #{slotIdx + 1}</span>
                      </div>
                      <span>{draggedBlock.layoutSize}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm font-bold uppercase text-[#121212] dark:text-[#F3F4F6]">
                        {draggedBlock.label || 'Untitled Block'}
                      </span>
                      <span className="px-2 py-0.5 bg-[#fef08a] dark:bg-[#292312] text-[#121212] dark:text-[#FBBF24] border border-[#121212] dark:border-[#FBBF24] font-display text-[10px] font-bold uppercase rounded">
                        {draggedBlock.type}
                      </span>
                    </div>
                    <div className="mt-2 font-display text-lg font-bold text-[#6b38d4] dark:text-[#C084FC] truncate">
                      {Array.isArray(draggedBlock.value)
                        ? `${draggedBlock.value.length} Checklist Items`
                        : String(draggedBlock.value || '—')}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* ZONE 3: BOTTOM PALETTE DOCK (BUILDING BLOCKS SHELF - CLICK OR DRAG ONTO CANVAS) */}
        <div className="shrink-0 bg-[#fef08a] dark:bg-[#1E232E] border-t-2 border-[#121212] dark:border-[#383F50] px-3.5 py-2 flex flex-col md:flex-row items-center justify-between gap-2 z-20 shadow-[0_-2px_0_rgba(18,18,18,0.1)] transition-colors select-none">
          {/* Dock Header */}
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#121212] dark:text-[#FBBF24] text-[20px]">
              widgets
            </span>
            <span className="font-display text-sm font-bold uppercase text-[#121212] dark:text-[#F3F4F6] tracking-wider">
              ADD BLOCK:
            </span>
          </div>

          {/* Interactive Block Badges (Click to Add OR Drag by Mouse onto Canvas!) */}
          <div className="flex flex-wrap items-center justify-center gap-2 overflow-x-auto max-w-full py-0.5">
            {/* Text Block Button */}
            <button
              onMouseDown={(e) =>
                handlePaletteChipMouseDown(e, 'text', null, '+ Short Text')
              }
              className="palette-chip group flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-[#10141C] hover:bg-[#bae6fd] dark:hover:bg-[#132637] text-[#121212] dark:text-[#F3F4F6] dark:hover:text-[#38BDF8] border-2 border-[#121212] dark:border-[#383F50] dark:hover:border-[#38BDF8] shadow-[2px_2px_0_#121212] dark:shadow-[2px_2px_0_#000000] hover:shadow-[3px_3px_0_#121212] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all rounded cursor-grab active:cursor-grabbing"
              type="button"
            >
              <span className="font-display text-sm font-bold text-[#6b38d4] dark:text-[#A855F7] leading-none">
                T
              </span>
              <span className="font-display text-[10px] font-bold uppercase">
                + Short Text
              </span>
            </button>

            {/* Number Block Button */}
            <button
              onMouseDown={(e) =>
                handlePaletteChipMouseDown(e, 'number', null, '+ Number')
              }
              className="palette-chip group flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-[#10141C] hover:bg-[#bbf7d0] dark:hover:bg-[#122A21] text-[#121212] dark:text-[#F3F4F6] dark:hover:text-[#34D399] border-2 border-[#121212] dark:border-[#383F50] dark:hover:border-[#34D399] shadow-[2px_2px_0_#121212] dark:shadow-[2px_2px_0_#000000] hover:shadow-[3px_3px_0_#121212] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all rounded cursor-grab active:cursor-grabbing"
              type="button"
            >
              <span className="font-display text-sm font-bold text-[#121212] dark:text-[#34D399] leading-none">
                #
              </span>
              <span className="font-display text-[10px] font-bold uppercase">
                + Number
              </span>
            </button>

            {/* Checklist Block Button */}
            <button
              onMouseDown={(e) =>
                handlePaletteChipMouseDown(e, 'checklist', null, '+ Checklist')
              }
              className="palette-chip group flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-[#10141C] hover:bg-[#ffd1dc] dark:hover:bg-[#2A161D] text-[#121212] dark:text-[#F3F4F6] dark:hover:text-[#FB7185] border-2 border-[#121212] dark:border-[#383F50] dark:hover:border-[#FB7185] shadow-[2px_2px_0_#121212] dark:shadow-[2px_2px_0_#000000] hover:shadow-[3px_3px_0_#121212] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all rounded cursor-grab active:cursor-grabbing"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-[#b4136e] dark:text-[#FB7185]">
                check_box
              </span>
              <span className="font-display text-[10px] font-bold uppercase">
                + Checklist
              </span>
            </button>

            {/* Training Sets & Reps Pair Button */}
            <button
              onMouseDown={(e) =>
                handlePaletteChipMouseDown(
                  e,
                  'number',
                  'sets-reps-pair',
                  '+ Sets & Reps'
                )
              }
              className="palette-chip group flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-[#10141C] hover:bg-[#f3e8ff] dark:hover:bg-[#2E1850] text-[#121212] dark:text-[#F3F4F6] dark:hover:text-[#C084FC] border-2 border-[#121212] dark:border-[#383F50] dark:hover:border-[#A855F7] shadow-[2px_2px_0_#121212] dark:shadow-[2px_2px_0_#000000] hover:shadow-[3px_3px_0_#121212] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all rounded cursor-grab active:cursor-grabbing"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-[#006577] dark:text-[#38BDF8]">
                fitness_center
              </span>
              <span className="font-display text-[10px] font-bold uppercase">
                + Sets & Reps
              </span>
            </button>

            {/* Large Notes Block Button */}
            <button
              onMouseDown={(e) =>
                handlePaletteChipMouseDown(e, 'longText', null, '+ Large Notes')
              }
              className="palette-chip group flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-[#10141C] hover:bg-[#fef08a] dark:hover:bg-[#292312] text-[#121212] dark:text-[#F3F4F6] dark:hover:text-[#FBBF24] border-2 border-[#121212] dark:border-[#383F50] dark:hover:border-[#FBBF24] shadow-[2px_2px_0_#121212] dark:shadow-[2px_2px_0_#000000] hover:shadow-[3px_3px_0_#121212] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all rounded cursor-grab active:cursor-grabbing"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-[#121212] dark:text-[#FBBF24]">
                segment
              </span>
              <span className="font-display text-[10px] font-bold uppercase">
                + Large Notes
              </span>
            </button>

            {/* Tags Block Button */}
            <button
              onMouseDown={(e) =>
                handlePaletteChipMouseDown(e, 'text', 'tags', '+ Tags')
              }
              className="palette-chip group flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-[#10141C] hover:bg-[#fed7aa] dark:hover:bg-[#2E190B] text-[#121212] dark:text-[#F3F4F6] dark:hover:text-[#FB923C] border-2 border-[#121212] dark:border-[#383F50] dark:hover:border-[#FB923C] shadow-[2px_2px_0_#121212] dark:shadow-[2px_2px_0_#000000] hover:shadow-[3px_3px_0_#121212] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all rounded cursor-grab active:cursor-grabbing"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-[#121212] dark:text-[#FB923C]">
                label
              </span>
              <span className="font-display text-[10px] font-bold uppercase">
                + Tags
              </span>
            </button>
          </div>

          {/* Quick Status helper */}
          <div className="hidden xl:flex items-center gap-1 text-[10px] font-display font-bold text-[#121212] dark:text-[#9CA3AF]">
            <span className="material-symbols-outlined text-[16px]">drag_pan</span>
            <span>CLICK OR DRAG TO CANVAS</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewTaskModal;
