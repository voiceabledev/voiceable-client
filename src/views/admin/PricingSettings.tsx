"use client"

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  DollarSign,
} from "lucide-react";
import { adminApi, AdminPricingSetting } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CATEGORIES = [
  { value: 'llm', label: 'LLM' },
  { value: 'tts', label: 'TTS' },
  { value: 'stt', label: 'STT' },
  { value: 'transport', label: 'Transport' },
  { value: 'hosting', label: 'Hosting' },
] as const;

export default function AdminPricingSettings() {
  const { toast } = useToast();
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(100);
  const [pricingSettings, setPricingSettings] = useState<AdminPricingSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSetting, setEditingSetting] = useState<AdminPricingSetting | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingSetting, setDeletingSetting] = useState<AdminPricingSetting | null>(null);
  const [activeCategory, setActiveCategory] = useState<'llm' | 'tts' | 'stt' | 'transport' | 'hosting'>('llm');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [commissionMarkup, setCommissionMarkup] = useState<number>(0.70);
  const [commissionMarkupInput, setCommissionMarkupInput] = useState<string>('70');
  const [savingCommission, setSavingCommission] = useState(false);

  // Form state for create/edit
  const [formData, setFormData] = useState<Partial<AdminPricingSetting>>({
    category: 'llm',
    provider: '',
    model_id: '',
    name: '',
    cost_per_minute: undefined,
    cost_per_million_tokens: undefined,
    active: true,
    display_order: 0,
  });

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  const fetchPricingSettings = async () => {
    setLoading(true);
    try {
        const response = await adminApi.pricingSettings.list();
        if (response.data) {
          setPricingSettings(response.data);
        }
    } catch (error) {
      console.error("Error fetching pricing settings:", error);
      toast({
        title: "Error",
        description: "Failed to load pricing settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingSettings();
    fetchCommissionMarkup();
  }, []);

  const fetchCommissionMarkup = async () => {
    try {
      const response = await adminApi.pricingSettings.getCommissionMarkup();
      if (response.data?.commission_markup !== undefined) {
        const markup = response.data.commission_markup;
        setCommissionMarkup(markup);
        setCommissionMarkupInput((markup * 100).toFixed(2));
      }
    } catch (error) {
      console.error("Error fetching commission markup:", error);
      // Fallback to default 0.70
      setCommissionMarkup(0.70);
      setCommissionMarkupInput('70.00');
    }
  };

  const handleSaveCommissionMarkup = async () => {
    const markupValue = parseFloat(commissionMarkupInput);
    
    if (isNaN(markupValue) || markupValue < 0 || markupValue > 1000) {
      toast({
        title: "Validation Error",
        description: "Commission markup must be between 0 and 1000%.",
        variant: "destructive",
      });
      return;
    }

    const markupDecimal = markupValue / 100;
    setSavingCommission(true);
    try {
      await adminApi.pricingSettings.updateCommissionMarkup(markupDecimal);
      setCommissionMarkup(markupDecimal);
      // Update the input to reflect the saved value (in case backend rounded it)
      setCommissionMarkupInput(markupValue.toFixed(2));
      toast({
        title: "Success",
        description: "Commission markup updated successfully.",
      });
    } catch (error: any) {
      console.error("Error saving commission markup:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.errors?.join(', ') || error?.response?.data?.status?.message || "Failed to save commission markup.",
        variant: "destructive",
      });
    } finally {
      setSavingCommission(false);
    }
  };

  const handleEdit = (setting: AdminPricingSetting) => {
    setEditingSetting(setting);
    setFormData({
      category: setting.category,
      provider: setting.provider,
      model_id: setting.model_id || '',
      name: setting.name,
      cost_per_minute: setting.cost_per_minute,
      cost_per_million_tokens: setting.cost_per_million_tokens,
      active: setting.active,
      display_order: setting.display_order || 0,
    });
    setShowCreateDialog(true);
  };

  const handleCreate = () => {
    setEditingSetting(null);
    setFormData({
      category: activeCategory,
      provider: '',
      model_id: '',
      name: '',
      cost_per_minute: undefined,
      cost_per_million_tokens: undefined,
      active: true,
      display_order: 0,
    });
    setShowCreateDialog(true);
  };

  const handleSave = async () => {
    if (!formData.category || !formData.provider || !formData.name) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.cost_per_minute && !formData.cost_per_million_tokens) {
      toast({
        title: "Validation Error",
        description: "Please provide either cost per minute or cost per million tokens.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (editingSetting) {
        await adminApi.pricingSettings.update(editingSetting.id, formData);
        toast({
          title: "Success",
          description: "Pricing setting updated successfully.",
        });
      } else {
        await adminApi.pricingSettings.create(formData);
        toast({
          title: "Success",
          description: "Pricing setting created successfully.",
        });
      }
      setShowCreateDialog(false);
      fetchPricingSettings();
    } catch (error: any) {
      console.error("Error saving pricing setting:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.errors?.join(', ') || "Failed to save pricing setting.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSetting) return;

    setDeleting(true);
    try {
      await adminApi.pricingSettings.destroy(deletingSetting.id);
      toast({
        title: "Success",
        description: "Pricing setting deleted successfully.",
      });
      setShowDeleteDialog(false);
      setDeletingSetting(null);
      fetchPricingSettings();
    } catch (error) {
      console.error("Error deleting pricing setting:", error);
      toast({
        title: "Error",
        description: "Failed to delete pricing setting.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const getPriceWithCommission = (setting: AdminPricingSetting): number => {
    if (setting.cost_per_minute) {
      return setting.cost_per_minute * (1 + commissionMarkup);
    }
    if (setting.cost_per_million_tokens) {
      return setting.cost_per_million_tokens * (1 + commissionMarkup);
    }
    return 0;
  };

  const getGrossMargin = (markup: number): number => {
    // Gross margin = (price - cost) / price = markup / (1 + markup)
    return (markup / (1 + markup)) * 100;
  };

  const formatPrice = (price: number | undefined, unit: 'min' | 'tokens' = 'min', withCommission: boolean = false): string => {
    if (price === undefined || price === null) return '—';
    // For prices with commission, use toFixed(4) to match Pricing.tsx
    // For base costs, use toFixed(6) and remove trailing zeros
    const formatted = withCommission ? price.toFixed(4) : price.toFixed(6).replace(/\.?0+$/, '');
    return unit === 'min' ? `$${formatted}/min` : `$${formatted}/1M tokens`;
  };

  const filteredSettings = pricingSettings.filter(s => s.category === activeCategory);

  return (
    <div className="h-full flex flex-col">
      <div ref={headerRef} className="p-4 md:p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <DollarSign className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              Pricing Settings
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Manage pricing for LLM, TTS, STT, Transport, and Hosting services
            </p>
          </div>
          <Button 
            onClick={handleCreate}
            className="flex items-center gap-2 relative z-10"
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add Pricing
          </Button>
        </div>
        
        {/* Commission Markup Settings */}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">
                Commission Markup (%)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="1000"
                  step="0.01"
                  value={commissionMarkupInput}
                  onChange={(e) => {
                    setCommissionMarkupInput(e.target.value);
                  }}
                  onInput={(e) => {
                    // Ensure the value updates on input
                    setCommissionMarkupInput((e.target as HTMLInputElement).value);
                  }}
                  className="w-32"
                  placeholder="70.00"
                  autoComplete="off"
                />
                <Button
                  onClick={handleSaveCommissionMarkup}
                  disabled={savingCommission}
                  size="sm"
                >
                  {savingCommission ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <div>Current: {(commissionMarkup * 100).toFixed(2)}%</div>
              <div className="font-medium text-foreground">
                Gross Margin: {getGrossMargin(commissionMarkup).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6">
          <Tabs 
            value={activeCategory} 
            onValueChange={(value) => {
              if (['llm', 'tts', 'stt', 'transport', 'hosting'].includes(value)) {
                setActiveCategory(value as 'llm' | 'tts' | 'stt' | 'transport' | 'hosting');
              }
            }} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-5 mb-6">
              {CATEGORIES.map((cat) => (
                <TabsTrigger key={cat.value} value={cat.value}>
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {CATEGORIES.map((cat) => (
              <TabsContent key={cat.value} value={cat.value} className="mt-0">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredSettings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No pricing settings found for {cat.label}. Click "Add Pricing" to create one.
                  </div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="max-h-[600px] overflow-y-auto relative">
                      <table className="w-full caption-bottom text-sm">
                        <thead className="sticky top-0 z-10 bg-background shadow-sm [&_tr]:border-b">
                          <tr className="border-b transition-colors">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background">Provider</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background">Model/Name</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background">Base Cost</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background">Price (with {(commissionMarkup * 100).toFixed(0)}% markup)</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background">Status</th>
                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground bg-background">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                        {filteredSettings.map((setting) => {
                          const priceWithCommission = getPriceWithCommission(setting);
                          return (
                            <TableRow key={setting.id}>
                              <TableCell className="font-medium">{setting.provider}</TableCell>
                              <TableCell>
                                {setting.model_id ? (
                                  <div>
                                    <div className="font-medium">{setting.name}</div>
                                    <div className="text-xs text-muted-foreground">{setting.model_id}</div>
                                  </div>
                                ) : (
                                  setting.name
                                )}
                              </TableCell>
                              <TableCell>
                                {setting.cost_per_minute !== undefined && setting.cost_per_minute !== null
                                  ? formatPrice(setting.cost_per_minute, 'min')
                                  : setting.cost_per_million_tokens !== undefined && setting.cost_per_million_tokens !== null
                                  ? formatPrice(setting.cost_per_million_tokens, 'tokens')
                                  : '—'}
                              </TableCell>
                              <TableCell>
                                {setting.cost_per_minute !== undefined && setting.cost_per_minute !== null
                                  ? formatPrice(priceWithCommission, 'min', true)
                                  : setting.cost_per_million_tokens !== undefined && setting.cost_per_million_tokens !== null
                                  ? formatPrice(priceWithCommission, 'tokens', true)
                                  : '—'}
                              </TableCell>
                              <TableCell>
                                <Badge variant={setting.active ? "default" : "secondary"}>
                                  {setting.active ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(setting)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setDeletingSetting(setting);
                                      setShowDeleteDialog(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSetting ? 'Edit Pricing Setting' : 'Create Pricing Setting'}</DialogTitle>
            <DialogDescription>
              {editingSetting ? 'Update the pricing setting details.' : 'Add a new pricing setting for a provider.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Provider *</label>
                <Input
                  value={formData.provider || ''}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="e.g., openai, anthropic, elevenlabs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Display name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Model ID</label>
                <Input
                  value={formData.model_id || ''}
                  onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
                  placeholder="e.g., gpt-5, claude-sonnet-4-5 (optional)"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cost per Minute</label>
                <Input
                  type="number"
                  step="0.000001"
                  value={formData.cost_per_minute || ''}
                  onChange={(e) => setFormData({ ...formData, cost_per_minute: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="0.000000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cost per Million Tokens</label>
                <Input
                  type="number"
                  step="0.000001"
                  value={formData.cost_per_million_tokens || ''}
                  onChange={(e) => setFormData({ ...formData, cost_per_million_tokens: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="0.000000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Order</label>
                <Input
                  type="number"
                  value={formData.display_order || 0}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2 flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active ?? true}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
              </div>
            </div>
            {(formData.cost_per_minute || formData.cost_per_million_tokens) && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-2">Price Preview (with {(commissionMarkup * 100).toFixed(0)}% commission):</div>
                <div className="text-lg font-semibold">
                  {formData.cost_per_minute
                    ? formatPrice((formData.cost_per_minute || 0) * (1 + commissionMarkup), 'min', true)
                    : formData.cost_per_million_tokens
                    ? formatPrice((formData.cost_per_million_tokens || 0) * (1 + commissionMarkup), 'tokens', true)
                    : '—'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Gross margin: {getGrossMargin(commissionMarkup).toFixed(2)}%
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Pricing Setting</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingSetting?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
