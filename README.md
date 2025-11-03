# Banking Dashboard - Financial Analytics Platform

A modern, full-featured banking dashboard built with Next.js 14, TypeScript, and Tailwind CSS v3. This application provides comprehensive financial analytics with beautiful visualizations and an intuitive user interface.

## Features

### Dashboard Overview
- Account balance cards (Checking, Savings, Credit Cards)
- Recent transactions list
- Daily spending overview chart
- Quick financial stats (Monthly income, expenses, savings rate)
- Budget utilization progress bars
- Upcoming bills reminder

### Transactions Page
- Searchable and filterable transaction table
- Advanced filters (Date range, category, transaction type)
- Sortable columns
- Pagination (20 items per page)
- Real-time transaction statistics
- Export functionality

### Analytics Page
- Spending by category (Pie Chart)
- Monthly spending trends (Line Chart)
- Income vs Expenses (Area Chart)
- Category comparison (Bar Chart)
- Top merchants analysis
- Category breakdown with month-over-month changes

### Reports Page
- Multiple report types (Monthly Statement, Tax Summary, Expense Report, Custom)
- Date range filtering
- Category-based filtering
- Real-time report preview
- Export options (PDF, CSV, Excel)
- Saved reports management

### Financial Planning
- Financial goals tracking with progress bars
- Savings projection calculator with compound interest
- Monthly budget overview
- Bill calendar and payment tracking
- Debt payoff calculator
- Goal deadline tracking

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3.4.0
- **Charts**: Recharts
- **State Management**: Zustand
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Tailwind Plugins**:
  - @tailwindcss/forms
  - @tailwindcss/typography
  - @tailwindcss/aspect-ratio
  - tailwindcss-animate

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Financial-banking-analytics
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
Financial-banking-analytics/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── transactions/
│   │   │   └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── reports/
│   │   │   └── page.tsx
│   │   ├── planning/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── Card.tsx
│   │   └── Button.tsx
│   ├── ChartContainer.tsx
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── StatCard.tsx
│   └── ThemeProvider.tsx
├── lib/
│   ├── mockData.ts
│   └── store.ts
├── types/
│   └── index.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Features Breakdown

### Dark Mode
- Full dark mode support with system preference detection
- Manual toggle available in the header
- Persistent theme selection

### Responsive Design
- Mobile-first approach
- Collapsible sidebar for mobile devices
- Responsive grid layouts
- Touch-friendly UI elements

### Mock Data
- 500+ realistic transactions
- Multiple account types
- Seasonal spending patterns
- Recurring transactions
- Comprehensive category system

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus indicators
- Screen reader friendly

## Customization

### Adding New Categories
Edit `lib/mockData.ts` to add new transaction categories:

```typescript
export const categories = [
  { name: 'Your Category', color: '#hexcolor' },
  // ... other categories
]
```

### Modifying Theme Colors
Edit `tailwind.config.js` and `app/globals.css` to customize the color scheme.

### Adding New Charts
Use Recharts components in your pages. Example:

```tsx
import { LineChart, Line, XAxis, YAxis } from 'recharts'

<LineChart data={yourData}>
  <Line dataKey="value" stroke="#3b82f6" />
</LineChart>
```

## Performance Optimizations

- Server-side rendering with Next.js 14
- Optimized images and assets
- Code splitting
- Lazy loading of heavy components
- Efficient state management with Zustand
- Tailwind CSS JIT mode

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] Real backend integration
- [ ] User authentication with NextAuth
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Real-time notifications
- [ ] Multi-currency support
- [ ] Bank account linking
- [ ] Advanced reporting with PDF generation
- [ ] Mobile app (React Native)

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue in the GitHub repository.

---

Built with ❤️ using Next.js and Tailwind CSS
