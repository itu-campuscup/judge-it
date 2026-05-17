# Overlapping Radar Charts Design

**Date:** 2025-01-17

## Goal

Replace the current side-by-side radar chart layout in the Contestants and Teams tabs with a single overlaid radar chart that renders two data series with different colours, enabling direct visual comparison of participants and teams.

## Architecture

The existing `RadarChartComponent` will be modified to support dual-entity overlay mode. The component will conditionally render one or two `<Radar>` elements on a single `<RadarChart>` based on whether a second entity is provided. A Recharts `<Legend>` component will be added to display entity names and colours.

## Tech Stack

- **Recharts v3.7.0** - Charting library (already in use)
- **MUI** - UI components for layout
- **TypeScript** - Type safety
- **React** - Component rendering

## Changes Required

### 1. `src/app/stats/components/RadarChartComponent.tsx`

**Current State:**
- Accepts single entity props: `imageUrl`, `name`, `altTextType`, `altText`, `data`
- Renders one `<Radar>` element with colour `#8884d8`, `fillOpacity: 0.6`, `strokeWidth: 3`
- Displays avatar, name, and alt text above the chart

**New State:**

**Props Interface:**
```typescript
interface EntityInfo {
  imageUrl?: string;
  name: string;
  altTextType: string;
  altText: string;
}

interface RadarChartComponentProps {
  entity1: EntityInfo;
  data1: RadarChartData[];
  entity2?: EntityInfo;       // optional - triggers overlay mode
  data2?: RadarChartData[];
}
```

**Rendering Logic:**
- **Single-entity mode** (`entity2` not provided): Renders exactly as today, one `<Radar>` element
- **Overlay mode** (`entity2` provided):
  - Above chart: Two info cards side-by-side, entity 1 left-aligned, entity 2 right-aligned. Each card includes avatar, name, and alt text. Use entity colour as accent (e.g. coloured border).
  - Chart: Single `<RadarChart>` with two `<Radar>` elements:
    - Entity 1: `#8884d8` (purple), `fillOpacity: 0.4`, `strokeWidth: 2`
    - Entity 2: `#4fc3f7` (light blue), `fillOpacity: 0.4`, `strokeWidth: 2`
  - Below chart: `<Legend>` component showing colour swatch + name for each entity

**Why `fillOpacity: 0.4`?** Lower than current 0.6 so overlap regions are visible when two series intersect.

### 2. `src/app/stats/Contestants.tsx`

**Current State:**
- Lines 290-308: Two `<RadarChartComponent>` instances in a flex row, each with separate data

**New State:**
- Remove the two separate `<RadarChartComponent>` instances
- Replace with single `<RadarChartComponent>`:
  ```tsx
  <RadarChartComponent
    entity1={{
      imageUrl: player1ChartData.imageUrl,
      name: player1ChartData.name,
      altTextType: "Fun Fact",
      altText: player1ChartData.funFact || ""
    }}
    data1={player1ChartData.data}
    entity2={{
      imageUrl: player2ChartData.imageUrl,
      name: player2ChartData.name,
      altTextType: "Fun Fact",
      altText: player2ChartData.funFact || ""
    }}
    data2={player2ChartData.data}
  />
  ```

**Data Pipeline:** No changes. The existing `player1ChartData` and `player2ChartData` computed via `generateRadarChartData` remain exactly the same.

### 3. `src/app/stats/Teams.tsx`

**Current State:**
- Lines 313-331: Two `<RadarChartComponent>` instances in a flex row

**New State:**
- Same pattern as Contestants: Single overlay component receiving both `team1ChartData` and `team2ChartData`

**Data Pipeline:** No changes.

### 4. `src/utils/visualizationUtils.ts`

**No changes required.** The `generateRadarChartData` function already returns `{ name, funFact, imageUrl, data }` per entity, which matches the new `EntityInfo` interface.

## Data Flow

```
Contestants.tsx / Teams.tsx
  -> Existing useMemo pipeline (unchanged)
    -> player1/team1ChartData, player2/team2ChartData
      -> RadarChartComponent (single instance, both entities)
        -> Two info cards above + single RadarChart with two Radar series + Legend below
```

## Error Handling

- If only one entity selected (second dropdown empty): Component renders in single-entity mode automatically (fallback behaviour)
- Missing `entity2` but `data2` provided, or vice versa: TypeScript will catch at compile time
- Empty data arrays: Recharts handles gracefully, renders empty chart

## Testing

- **Unit tests for RadarChartComponent:**
  - Single-entity mode (existing behaviour preserved)
  - Overlay mode with two entities
  - Legend displays correctly in overlay mode
  - Colours match spec (purple + light blue)

- **E2E tests:**
  - Contestants tab: Select two players, verify single overlaid chart with both colours
  - Teams tab: Select two teams, verify single overlaid chart
  - Verify legend shows correct names
  - Verify info cards display avatars, names, fun facts above chart

- **Manual visual checks:**
  - Opacity levels allow visibility of overlapping regions
  - Colours are clearly distinguishable
  - Layout responsive on different screen sizes

## Constraints

- No new dependencies (Recharts already supports multiple `<Radar>` elements)
- No schema or data model changes
- No new files
- Must preserve backward compatibility for any other uses of `RadarChartComponent` (none currently, but good practice)

## Success Criteria

1. Contestants and Teams tabs display a single radar chart with two overlaid series
2. Each series uses distinct colour (purple for entity 1, light blue for entity 2)
3. Both entity info cards (avatar, name, fun fact) display above the chart
4. Legend displays below the chart with colour-coded entity names
5. Overlapping regions are visible (opacity 0.4)
6. Existing single-entity mode still works when second entity not provided
7. All existing tests pass
8. No breaking changes to other components