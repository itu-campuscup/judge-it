# Overlapping Radar Charts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace side-by-side radar charts with single overlaid radar chart in Contestants and Teams tabs

**Architecture:** Modify existing RadarChartComponent to support dual-entity overlay mode with two colours and legend

**Tech Stack:** Recharts v3.7.0, MUI, TypeScript, React

---

### Task 1: Update RadarChartComponent props interface

**Files:**
- Modify: `src/app/stats/components/RadarChartComponent.tsx:11-23`

- [ ] **Step 1: Replace props interface with EntityInfo and new structure**

```tsx
interface EntityInfo {
  imageUrl?: string;
  name: string;
  altTextType: string;
  altText: string;
}

interface RadarChartComponentProps {
  entity1: EntityInfo;
  data1: RadarChartData[];
  entity2?: EntityInfo;
  data2?: RadarChartData[];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/stats/components/RadarChartComponent.tsx
git commit -m "refactor: update RadarChartComponent props for overlay mode"
```

---

### Task 2: Update RadarChartComponent component signature

**Files:**
- Modify: `src/app/stats/components/RadarChartComponent.tsx:25-31`

- [ ] **Step 1: Destructure new props**

```tsx
const RadarChartComponent: React.FC<RadarChartComponentProps> = ({
  entity1,
  data1,
  entity2,
  data2,
}) => {
```

- [ ] **Step 2: Commit**

```bash
git add src/app/stats/components/RadarChartComponent.tsx
git commit -m "refactor: update RadarChartComponent to use new props"
```

---

### Task 3: Add Legend import from Recharts

**Files:**
- Modify: `src/app/stats/components/RadarChartComponent.tsx:3-9`

- [ ] **Step 1: Add Legend to imports**

```tsx
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
```

- [ ] **Step 2: Commit**

```bash
git add src/app/stats/components/RadarChartComponent.tsx
git commit -m "feat: add Legend import from Recharts"
```

---

### Task 4: Create info card component helper

**Files:**
- Modify: `src/app/stats/components/RadarChartComponent.tsx:31`

- [ ] **Step 1: Add EntityInfoCard component before main component**

```tsx
interface EntityInfoCardProps {
  entity: EntityInfo;
  align: "left" | "right";
  color: string;
}

const EntityInfoCard: React.FC<EntityInfoCardProps> = ({
  entity,
  align,
  color,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: align === "left" ? "flex-start" : "flex-end",
        mb: 3,
        minHeight: "200px",
        flex: 1,
        textAlign: align,
      }}
    >
      {align === "right" && (
        <Box sx={{ textAlign: "right", flex: 1 }}>
          <Typography
            variant="h2"
            component="div"
            sx={{
              fontSize: "2rem",
              fontWeight: "bold",
              mb: 1,
              color: color,
            }}
          >
            {entity.name}
          </Typography>
          {entity.altText != null && entity.altText != "" && (
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{
                wordWrap: "break-word",
                overflowWrap: "break-word",
                fontSize: "1.2rem",
              }}
            >
              {entity.altTextType}: {entity.altText}
            </Typography>
          )}
        </Box>
      )}
      {entity.imageUrl && (
        <Avatar
          src={entity.imageUrl}
          alt={entity.name}
          sx={{
            width: 140,
            height: 140,
            mx: align === "left" ? 0 : 2,
            mr: align === "left" ? 2 : 0,
            border: `3px solid ${color}`,
          }}
        />
      )}
      {align === "left" && (
        <Box sx={{ textAlign: "left", flex: 1 }}>
          <Typography
            variant="h2"
            component="div"
            sx={{
              fontSize: "2rem",
              fontWeight: "bold",
              mb: 1,
              color: color,
            }}
          >
            {entity.name}
          </Typography>
          {entity.altText != null && entity.altText != "" && (
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{
                wordWrap: "break-word",
                overflowWrap: "break-word",
                fontSize: "1.2rem",
              }}
            >
              {entity.altTextType}: {entity.altText}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/app/stats/components/RadarChartComponent.tsx
git commit -m "feat: add EntityInfoCard helper component"
```

---

### Task 5: Update main layout for single-entity mode

**Files:**
- Modify: `src/app/stats/components/RadarChartComponent.tsx:33-86`

- [ ] **Step 1: Replace entire return statement with conditional logic for single-entity mode**

```tsx
  return (
    <Box
      sx={{
        textAlign: "center",
        mb: 2,
        maxWidth: "550px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {!entity2 ? (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
              minHeight: "200px",
              flexShrink: 0,
            }}
          >
            {entity1.imageUrl && (
              <Avatar
                src={entity1.imageUrl}
                alt={entity1.name}
                sx={{ width: 160, height: 160, mr: 3 }}
              />
            )}
            <Box sx={{ textAlign: "left", flex: 1 }}>
              <Typography
                variant="h2"
                component="div"
                sx={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  mb: 1,
                }}
              >
                {entity1.name}
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  fontSize: "1.5rem",
                }}
              >
                {entity1.altText != null && entity1.altText != ""
                  ? `${entity1.altTextType}: ${entity1.altText}`
                  : ""}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
          >
            <RadarChart
              cx={250}
              cy={200}
              outerRadius={160}
              width={500}
              height={400}
              data={data1}
            >
              <PolarGrid gridType="circle" />
              <PolarAngleAxis
                dataKey="subject"
                style={{ fontSize: "14px", fontWeight: "bold" }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                style={{ fontSize: "12px" }}
              />
              <Radar
                name={entity1.name}
                dataKey="Performance"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
                strokeWidth={3}
              />
            </RadarChart>
          </Box>
        </>
      ) : (
        <>
          {/* Overlay mode will be added in next tasks */}
        </>
      )}
    </Box>
  );
```

- [ ] **Step 2: Commit**

```bash
git add src/app/stats/components/RadarChartComponent.tsx
git commit -m "feat: add single-entity mode with conditional rendering"
```

---

### Task 6: Implement overlay mode layout with info cards

**Files:**
- Modify: `src/app/stats/components/RadarChartComponent.tsx:83-86`

- [ ] **Step 1: Add overlay mode info cards layout**

Replace the `<> {/* Overlay mode will be added in next tasks */} </>` with:

```tsx
          <Box
            sx={{
              display: "flex",
              gap: 4,
              mb: 3,
              minHeight: "200px",
              flexShrink: 0,
            }}
          >
            <EntityInfoCard
              entity={entity1}
              align="left"
              color="#8884d8"
            />
            <EntityInfoCard
              entity={entity2!}
              align="right"
              color="#4fc3f7"
            />
          </Box>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/stats/components/RadarChartComponent.tsx
git commit -m "feat: add overlay mode info cards layout"
```

---

### Task 7: Implement overlay mode chart with two Radar series

**Files:**
- Modify: `src/app/stats/components/RadarChartComponent.tsx:101-108`

- [ ] **Step 1: Add overlaid chart with Legend**

After the info cards box, add:

```tsx
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
          >
            <RadarChart
              cx={300}
              cy={200}
              outerRadius={160}
              width={600}
              height={400}
              data={data1}
            >
              <PolarGrid gridType="circle" />
              <PolarAngleAxis
                dataKey="subject"
                style={{ fontSize: "14px", fontWeight: "bold" }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                style={{ fontSize: "12px" }}
              />
              <Radar
                name={entity1.name}
                dataKey="Performance"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.4}
                strokeWidth={2}
              />
              <Radar
                name={entity2!.name}
                dataKey="Performance"
                data={data2}
                stroke="#4fc3f7"
                fill="#4fc3f7"
                fillOpacity={0.4}
                strokeWidth={2}
              />
              <Legend />
            </RadarChart>
          </Box>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/stats/components/RadarChartComponent.tsx
git commit -m "feat: add overlaid chart with two Radar series and Legend"
```

---

### Task 8: Update Contestants.tsx to use overlay mode

**Files:**
- Modify: `src/app/stats/Contestants.tsx:279-309`

- [ ] **Step 1: Replace two separate charts with single overlay**

Replace the entire `<Box sx={{ flex: 1, display: "flex", justifyContent: "space-around", alignItems: "stretch", gap: 3, overflow: "hidden", minHeight: 0 }}>` and its contents with:

```tsx
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
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
      </Box>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/stats/Contestants.tsx
git commit -m "feat: update Contestants tab to use overlaid radar chart"
```

---

### Task 9: Update Teams.tsx to use overlay mode

**Files:**
- Modify: `src/app/stats/Teams.tsx:302-332`

- [ ] **Step 1: Replace two separate charts with single overlay**

Replace the entire `<Box sx={{ flex: 1, display: "flex", justifyContent: "space-around", alignItems: "stretch", gap: 3, overflow: "hidden", minHeight: 0 }}>` and its contents with:

```tsx
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        <RadarChartComponent
          entity1={{
            imageUrl: team1ChartData.imageUrl,
            name: team1ChartData.name,
            altTextType: "",
            altText: ""
          }}
          data1={team1ChartData.data}
          entity2={{
            imageUrl: team2ChartData.imageUrl,
            name: team2ChartData.name,
            altTextType: "",
            altText: ""
          }}
          data2={team2ChartData.data}
        />
      </Box>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/stats/Teams.tsx
git commit -m "feat: update Teams tab to use overlaid radar chart"
```

---

### Task 10: Run build and verify no TypeScript errors

**Files:**
- All modified files

- [ ] **Step 1: Run build**

```bash
bun run build
```

Expected: Build succeeds with no errors

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "build: verify successful build after overlay implementation"
```

---

### Task 11: Run linter and auto-fix

**Files:**
- All modified files

- [ ] **Step 1: Run linter**

```bash
bun lint
```

Expected: No linting errors (or auto-fixed)

- [ ] **Step 2: Commit if any fixes**

```bash
git add .
git commit -m "style: auto-fix linting issues"
```

---

### Task 12: Test the implementation manually

**Files:**
- All modified files

- [ ] **Step 1: Start dev server**

```bash
bun dev
```

- [ ] **Step 2: Navigate to stats page, open Contestants tab, select two different players**

Expected: Single overlaid radar chart with purple and light blue series, both entity info cards above, legend below

- [ ] **Step 3: Navigate to Teams tab, select two different teams**

Expected: Single overlaid radar chart with both teams' data, same visual pattern

- [ ] **Step 4: Select only one player/team and verify single-entity mode works**

Expected: Single radar chart with no overlay, same as before modification

---

### Task 13: Final verification

**Files:**
- All modified files

- [ ] **Step 1: Run build again to confirm**

```bash
bun run build
```

Expected: Build succeeds

- [ ] **Step 2: Commit final version**

```bash
git add .
git commit -m "feat: complete overlapping radar charts implementation"
```