/**
 * 看板页模板 —— 复制到你的项目后改名即可
 *
 * 用法:
 *   cp templates/DashboardPage.tsx your-project/src/pages/DashboardPage.tsx
 *
 * 复制后需改导入路径:
 *   - 组件同目录:  from '../components'
 *   - 别名导入:    from '@/design-system/components'
 *   - 本文件内保持 from '../components'（相对 src/ 层级）
 *
 * 包含: 页面骨架 + 筛选栏 + 指标卡区 + 图表区 + 洞察侧栏 + 数据表
 * 图表本体用内联 SVG 占位，接真实图表库时替换 <PlaceholderChart /> 即可
 */
import React from 'react';
import {
  Button,
  Card,
  CardHeader,
  Badge,
  Grid,
  MetricCard,
  ChartFrame,
  DataTable,
  FilterBar,
  SegmentedControl,
  ThresholdBar,
  InsightList,
  CellTitle,
  type DataTableColumn,
} from '../src/components';

// ---------- 类型定义（按实际业务替换） ----------
interface ChannelRow {
  id: string;
  name: string;
  subtitle: string;
  spend: string;
  ctr: string;
  cpa: string;
  tone: 'success' | 'warning' | 'danger';
  status: string;
}

// ---------- 图表占位（接真实图表库时替换） ----------
function PlaceholderChart() {
  return (
    <svg viewBox="0 0 640 220" style={{ width: '100%', height: '100%' }} role="img" aria-label="消耗趋势折线图">
      {/* 网格线：只画横向 */}
      <line className="ds-chart__grid-line" x1="40" y1="40" x2="620" y2="40" />
      <line className="ds-chart__grid-line" x1="40" y1="95" x2="620" y2="95" />
      <line className="ds-chart__grid-line" x1="40" y1="150" x2="620" y2="150" />
      <line className="ds-chart__axis-line" x1="40" y1="190" x2="620" y2="190" />
      {/* 轴标签 */}
      <text className="ds-chart__axis-label" x="4" y="44">60k</text>
      <text className="ds-chart__axis-label" x="4" y="99">40k</text>
      <text className="ds-chart__axis-label" x="4" y="154">20k</text>
      <text className="ds-chart__axis-label" x="12" y="193">0</text>
      {/* 数据系列：颜色必须用 chart.series-* 变量，顺序固定 */}
      <path
        className="ds-chart__series"
        d="M45,160 L95,140 L145,152 L195,118 L245,128 L295,96 L345,108 L395,78 L445,90 L495,60 L545,72 L595,48"
        stroke="var(--ds-semantic-chart-series-1)"
      />
      <path
        className="ds-chart__series"
        d="M45,176 L95,170 L145,178 L195,160 L245,166 L295,148 L345,156 L395,138 L445,146 L495,128 L545,138 L595,120"
        stroke="var(--ds-semantic-chart-series-2)"
      />
    </svg>
  );
}

// ---------- 主页面 ----------
export default function DashboardPage() {
  const [range, setRange] = React.useState('7d');
  const [page, setPage] = React.useState(1);

  const rows: ChannelRow[] = [
    { id: '1', name: '巨量千川 / 品牌广告', subtitle: '计划 3 个', spend: '¥128,400', ctr: '3.42%', cpa: '¥3.58', tone: 'success', status: '正常' },
    { id: '2', name: 'Meta / Advantage+', subtitle: '计划 2 个', spend: '$42,180', ctr: '2.87%', cpa: '$4.12', tone: 'warning', status: '关注' },
    { id: '3', name: '腾讯广告 / 视频号', subtitle: '计划 5 个', spend: '¥96,750', ctr: '4.06%', cpa: '¥3.01', tone: 'success', status: '正常' },
    { id: '4', name: 'Google / UAC', subtitle: '计划 1 个', spend: '$18,900', ctr: '1.94%', cpa: '$5.30', tone: 'danger', status: '异常' },
  ];

  const columns: DataTableColumn<ChannelRow>[] = [
    { key: 'name', header: '渠道 / 计划' },
    { key: 'spend', header: '消耗', numeric: true },
    { key: 'ctr', header: 'CTR', numeric: true },
    { key: 'cpa', header: 'CPA', numeric: true },
    { key: 'status', header: '状态', render: (r) => <Badge tone={r.tone}>{r.status}</Badge> },
  ];

  return (
    <div className="ds-page">
      {/* 页面头 */}
      <header className="ds-page__header">
        <div>
          <h1 className="ds-page__title">投放总览</h1>
          <p className="ds-page__desc">近 7 天 · 4 个广告账户 · 数据每小时更新</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--ds-space-3)' }}>
          <Button variant="secondary">导出</Button>
          <Button variant="primary">新建计划</Button>
        </div>
      </header>

      {/* 筛选栏：全局筛选，放在指标卡上方 */}
      <div style={{ marginBottom: 'var(--ds-space-4)' }}>
        <FilterBar actions={<Button size="sm">重置</Button>}>
          <span className="ds-filterbar__label">时间范围</span>
          <SegmentedControl
            options={[
              { value: '7d', label: '近 7 天' },
              { value: '30d', label: '近 30 天' },
              { value: '90d', label: '近 90 天' },
            ]}
            value={range}
            onChange={setRange}
            ariaLabel="时间范围"
          />
          <span className="ds-filterbar__label">渠道</span>
          <Button size="sm" variant="secondary">全部渠道 ▾</Button>
        </FilterBar>
      </div>

      {/* 指标卡区 */}
      <Grid span="4">
        <MetricCard
          label="总消耗"
          value="286,430"
          unit="元"
          trend={{ value: '12.4%', direction: 'positive', comparison: '较上周期' }}
          spark={[12, 18, 15, 22, 19, 26, 31, 28, 36]}
        />
        <MetricCard
          label="转化成本"
          value="3.82"
          unit="元"
          trend={{ value: '4.6%', direction: 'negative', comparison: '较上周期' }}
          spark={[3.2, 3.5, 3.4, 3.8, 3.6, 3.9, 4.1, 3.9, 4.3]}
        />
        <MetricCard
          label="点击率 CTR"
          value="2.94"
          unit="%"
          trend={{ value: '0.3 个百分点', direction: 'positive' }}
          spark={[2.1, 2.4, 2.3, 2.6, 2.5, 2.8, 2.7, 2.9, 2.94]}
        />
        <MetricCard
          label="曝光频次"
          value="2.7"
          unit="次"
          trend={{ value: '0.0', direction: 'flat', comparison: '较上周期' }}
          spark={[2.7, 2.6, 2.8, 2.7, 2.7, 2.6, 2.8, 2.7, 2.7]}
        />
      </Grid>

      {/* 图表 + 洞察侧栏 */}
      <div style={{ marginTop: 'var(--ds-space-4)' }}>
        <Grid span="3-2">
          <ChartFrame
            title="消耗趋势"
            subtitle="按日 · 近 30 天"
            height="md"
            legend={[
              { label: '巨量千川', color: 'var(--ds-semantic-chart-series-1)' },
              { label: 'Meta', color: 'var(--ds-semantic-chart-series-2)' },
            ]}
          >
            <PlaceholderChart />
          </ChartFrame>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-4)' }}>
            <Card>
              <CardHeader title="自动洞察" subtitle="按影响面排序" />
              <InsightList
                items={[
                  { title: 'CPA 超标集中在 3 个素材上', description: '素材 CTR 正常但转化率下降 40%，建议排查落地页' },
                  { title: 'Meta 系列消耗占比升至 31%', description: '较上周期 +8 个百分点，Attention 竞价明显偏高' },
                  { title: '视频号新素材 CTR 表现最好', description: '近 3 天平均 CTR 4.8%，高于账户均值 1.9 个百分点' },
                ]}
              />
            </Card>

            <Card>
              <CardHeader title="阈值监控" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-4)' }}>
                <ThresholdBar name="日预算消耗" value={6800} max={10000} displayValue="6,800 / 10,000" />
                <ThresholdBar name="CPA 超标" value={142} max={100} displayValue="142 / 100" state="warning" />
                <ThresholdBar name="转化回传延迟" value={45} max={30} displayValue="45 / 30" state="danger" />
              </div>
            </Card>
          </div>
        </Grid>
      </div>

      {/* 明细数据表 */}
      <div style={{ marginTop: 'var(--ds-space-4)' }}>
        <DataTable
          title="渠道投放表现"
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          renderName={(r) => <CellTitle title={r.name} subtitle={r.subtitle} />}
          page={page}
          pageSize={20}
          total={128}
          onPageChange={setPage}
          actions={<Button size="sm">列设置</Button>}
        />
      </div>
    </div>
  );
}
