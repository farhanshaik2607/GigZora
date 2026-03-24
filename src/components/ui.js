'use client';

export function SkeletonCard() {
  return (
    <div className="marketplace-card p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="skeleton h-5 w-48 mb-2" />
          <div className="skeleton h-4 w-32" />
        </div>
        <div className="skeleton h-8 w-16 rounded-md" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-6 w-24 rounded-full" />
      </div>
      <div className="skeleton h-4 w-full mb-2" />
      <div className="skeleton h-4 w-3/4 mb-4" />
      <div className="flex items-center justify-between">
        <div className="skeleton h-4 w-28" />
        <div className="skeleton h-8 w-24 rounded-md" />
      </div>
    </div>
  );
}

export function SkeletonInsight() {
  return (
    <div className="marketplace-card p-4 animate-pulse border-surface-200">
      <div className="skeleton h-4 w-24 mb-2" />
      <div className="skeleton h-6 w-16 mb-1" />
      <div className="skeleton h-2 w-full rounded-full" />
    </div>
  );
}

export function MatchBadge({ score }) {
  const getColor = (s) => {
    if (s >= 80) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (s >= 60) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-rose-100 text-rose-800 border-rose-200';
  };

  return (
    <div className={`px-2 py-1 rounded-md text-sm font-bold border ${getColor(score)} flex flex-row items-center gap-1`}>
      <span>{score}%</span>
      <span className="text-xs font-medium opacity-80 uppercase tracking-wide">Match</span>
    </div>
  );
}

export function LocationBadge({ type }) {
  const config = {
    local: { label: 'Local', className: 'bg-surface-100 text-surface-700' },
    national: { label: 'National', className: 'bg-surface-100 text-surface-700' },
    international: { label: 'Remote', className: 'bg-primary-50 text-primary-700 font-semibold' },
  };
  const { label, className } = config[type] || config.international;
  return <span className={`text-xs px-2 py-1 rounded-md ${className}`}>{label}</span>;
}

export function JobCard({ job, onClick }) {
  return (
    <div
      onClick={onClick}
      className="marketplace-card-hover p-5 cursor-pointer flex flex-col sm:flex-row gap-4 animate-fade-in group bg-white"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <p className="text-xs font-medium text-surface-500 uppdercase tracking-wider mb-1">
            Posted {job.postedDays}d ago
          </p>
          {job.matchScore !== undefined && <MatchBadge score={job.matchScore} />}
        </div>
        
        <h3 className="font-semibold text-lg text-surface-900 group-hover:text-primary-600 transition-colors mb-1 truncate">
          {job.title}
        </h3>
        
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3 text-sm text-surface-600">
          <span className="flex items-center gap-1 font-medium">
            <span className="font-bold">{job.salary || 'Hourly'}</span>
          </span>
          <span className="flex items-center gap-1">
            <LocationBadge type={job.locationType} />
          </span>
          <span className="flex items-center gap-1">
            {job.type}
          </span>
        </div>

        <p className="text-sm text-surface-600 line-clamp-2 mb-4">
          {job.description}
        </p>

        <div className="flex flex-wrap gap-2 items-center">
          {job.skills.slice(0, 5).map(skill => (
            <span key={skill} className="text-xs px-2.5 py-1 rounded-[4px] bg-surface-100 text-surface-600 font-medium hover:bg-surface-200 transition-colors">
              {skill}
            </span>
          ))}
          {job.skills.length > 5 && (
            <span className="text-xs px-2 py-1 text-surface-500 font-medium">
              +{job.skills.length - 5} more
            </span>
          )}
        </div>
      </div>
      
      <div className="sm:w-32 flex flex-col justify-between pt-1">
        <div className="text-right hidden sm:block">
          <span className="text-xs text-surface-500">{job.applicants} proposals</span>
        </div>
        <button className="hidden sm:block btn-outline w-full px-0 py-1.5 text-sm mt-auto">
          View Job
        </button>
      </div>
    </div>
  );
}

export function SuggestionCard({ suggestion }) {
  return (
    <div className="marketplace-card p-4 border-l-4 border-l-amber-500 shadow-sm animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h4 className="font-semibold text-surface-900 mb-1">
            Learn {suggestion.skill}
          </h4>
          <p className="text-sm text-surface-600 mb-2">{suggestion.message}</p>
          {suggestion.resources?.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-2">
              {suggestion.resources.map((res, i) => (
                <a
                  key={i}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 font-medium hover:underline flex items-center gap-1"
                >
                  <svg className="w-4 h-4 text-red-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
                    <path fill="#fff" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <span className="truncate">{res.title}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function InsightCard({ title, value, subtitle, icon, color }) {
  return (
    <div className="marketplace-card-hover p-5 animate-fade-in bg-white dark:bg-surface-900 flex flex-col justify-center items-start">
      <div className="flex items-center gap-3 w-full">
        <div className={`flex flex-col`}>
          <p className="text-sm font-medium text-surface-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-surface-900 dark:text-white">{value}</p>
          {subtitle && <p className="text-xs text-surface-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in bg-white dark:bg-surface-900 rounded-xl border border-surface-200 p-8 shadow-sm">
      <div className="text-6xl mb-4 grayscale opacity-50">{icon || '🔍'}</div>
      <h3 className="text-lg font-bold text-surface-800 mb-2">{title || 'No results found'}</h3>
      <p className="text-surface-500 text-sm max-w-sm">{description || 'Try adjusting your search or filters.'}</p>
    </div>
  );
}
