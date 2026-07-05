'use client';

import { useState } from 'react';
import type { SavedAllocation } from '@/lib/my-allocations/types';
import { SKILL_REGISTRY, getAllSkills } from '@/lib/skills/skill-registry';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SkillResult } from './SkillResult';
import { Zap, Loader2 } from 'lucide-react';

interface SkillBrowserProps {
  initialAllocations: SavedAllocation[];
  userId: string;
}

export function SkillBrowser({ initialAllocations, userId }: SkillBrowserProps) {
  const [selectedAllocationId, setSelectedAllocationId] = useState<string>(
    initialAllocations[0]?.id || ''
  );
  const [selectedSkillName, setSelectedSkillName] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [skillResult, setSkillResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const selectedAllocation = initialAllocations.find((a) => a.id === selectedAllocationId);
  const allSkills = getAllSkills();
  const selectedSkill = selectedSkillName ? SKILL_REGISTRY[selectedSkillName] : null;

  const executeSkill = async () => {
    if (!selectedSkillName || !selectedAllocationId) {
      setError('Please select a skill and allocation');
      return;
    }

    setIsExecuting(true);
    setError('');

    try {
      const response = await fetch('/api/skills/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillName: selectedSkillName,
          allocationId: selectedAllocationId,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to execute skill');
      }

      const data = await response.json();
      setSkillResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsExecuting(false);
    }
  };

  if (initialAllocations.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-white/10 rounded-xl">
        <Zap className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-slate-300 font-medium text-lg">No allocations to analyze</h3>
        <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
          Create and save an allocation in Investment Genie first, then come back to analyze it with trading skills.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Left Sidebar: Skill Selector */}
      <div className="lg:col-span-1">
        <Card className="border-primary/20 bg-card/50 backdrop-blur sticky top-8">
          <CardHeader>
            <CardTitle className="text-lg">Skills</CardTitle>
            <CardDescription>Select a trading skill</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Allocation Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Allocation</label>
              <select
                value={selectedAllocationId}
                onChange={(e) => setSelectedAllocationId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Choose allocation...</option>
                {initialAllocations.map((alloc) => (
                  <option key={alloc.id} value={alloc.id}>
                    {new Date(alloc.createdAt || '').toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Skill Categories */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Browse Skills</label>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allSkills.map((skill) => (
                  <button
                    key={skill.name}
                    onClick={() => setSelectedSkillName(skill.name)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedSkillName === skill.name
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{skill.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {skill.displayName}
                        </p>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {skill.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Execute Button */}
            <Button
              onClick={executeSkill}
              disabled={isExecuting || !selectedSkillName}
              className="w-full h-11"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Execute Skill
                </>
              )}
            </Button>

            {error && (
              <div className="p-2 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Main Area: Results */}
      <div className="lg:col-span-3">
        {selectedSkill && (
          <Card className="border-primary/20 bg-card/50 backdrop-blur mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {selectedSkill.icon} {selectedSkill.displayName}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {selectedSkill.description}
                  </CardDescription>
                </div>
                <Badge variant="outline">{selectedSkill.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-slate-400">
                Estimated execution: {selectedSkill.estimatedExecutionTimeMs}ms
              </div>
            </CardContent>
          </Card>
        )}

        {skillResult && <SkillResult result={skillResult} />}

        {!skillResult && selectedSkillName && !isExecuting && (
          <Card className="border-dashed border-white/10 bg-slate-900/20 backdrop-blur">
            <CardContent className="py-16 text-center">
              <Zap className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">
                Click "Execute Skill" to analyze your allocation
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
