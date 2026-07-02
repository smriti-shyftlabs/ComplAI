import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiShield, FiBell, FiUsers, FiLink, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { getUsers } from '../../services/userService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { SeverityBadge } from '../../components/common/Badge';
import { RULE_CATEGORIES, getRulesForCategory } from '../../data/categoryComplianceRules';

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${enabled ? 'bg-teal-700' : 'bg-gray-200'}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

export default function Settings() {
  const [tab, setTab] = useState('general');
  const [users, setUsers] = useState([]);
  const [ruleCategory, setRuleCategory] = useState('Food & Beverage');
  const [ruleSearch, setRuleSearch] = useState('');

  useEffect(() => {
    getUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  // Rules for the selected product category, filtered by the (preserved) search text.
  const categoryRules = getRulesForCategory(ruleCategory);
  const visibleRules = ruleSearch.trim()
    ? categoryRules.filter(r =>
        r.name.toLowerCase().includes(ruleSearch.toLowerCase()) ||
        r.description?.toLowerCase().includes(ruleSearch.toLowerCase()))
    : categoryRules;

  const [notifications, setNotifications] = useState({
    email: true, slack: false, sla: true, newProduct: true, approved: true, rejected: true, certificate: true
  });
  const [general, setGeneral] = useState({
    companyName: 'Acme Corp',
    adminEmail: 'admin@acme.com'
  });

  const tabs = [
    { id: 'general', label: 'General', icon: FiUser },
    { id: 'compliance', label: 'Compliance Rules', icon: FiShield },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'integrations', label: 'Integrations', icon: FiLink }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-700 text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your compliance platform settings</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="sm:w-48 flex-shrink-0">
          <div className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-shrink-0 sm:w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-500 transition-all text-left ${tab === t.id ? 'bg-teal-50 text-teal-800' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <t.icon className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6"
          >
            {tab === 'general' && (
              <div className="space-y-5">
                <h2 className="text-base font-600 text-gray-900">General Settings</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Company Name"
                    value={general.companyName}
                    onChange={e => setGeneral(g => ({ ...g, companyName: e.target.value }))}
                  />
                  <Input
                    label="Admin Email"
                    type="email"
                    value={general.adminEmail}
                    onChange={e => setGeneral(g => ({ ...g, adminEmail: e.target.value }))}
                  />
                  <div>
                    <label className="block text-sm font-500 text-gray-700 mb-1.5">Timezone</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white">
                      <option>UTC-5 (Eastern)</option>
                      <option>UTC-8 (Pacific)</option>
                      <option>UTC+0 (London)</option>
                      <option>UTC+1 (Berlin)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-500 text-gray-700 mb-1.5">Language</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <h3 className="text-sm font-600 text-gray-700 pt-2">Compliance Thresholds</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Minimum Compliance Score"
                      type="number"
                      defaultValue={75}
                      helperText="Products below this score require review"
                    />
                    <Input
                      label="Auto-Reject Below Score"
                      type="number"
                      defaultValue={30}
                      helperText="Products below this score auto-rejected"
                    />
                  </div>
                </div>
                <Button>Save Changes</Button>
              </div>
            )}

            {tab === 'compliance' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-600 text-gray-900">Compliance Rules</h2>
                  <Button size="sm" icon={FiPlus}>Add Rule</Button>
                </div>

                {/* Product-category segmented control */}
                <div className="inline-flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                  {RULE_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setRuleCategory(cat)}
                      className={`px-4 py-2 rounded-lg text-sm font-500 transition-all ${
                        ruleCategory === cat ? 'bg-teal-700 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search (preserved across category switches) */}
                <Input
                  placeholder="Search rules..."
                  value={ruleSearch}
                  onChange={e => setRuleSearch(e.target.value)}
                />

                <div className="space-y-2">
                  {visibleRules.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                      <p className="text-sm text-gray-500 font-500">No compliance rules found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {ruleSearch.trim()
                          ? `No ${ruleCategory} rules match "${ruleSearch}".`
                          : `No compliance rules are configured for ${ruleCategory}.`}
                      </p>
                    </div>
                  ) : (
                    visibleRules.map((rule) => (
                      <div key={rule.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-500 text-gray-900">{rule.name}</span>
                            <SeverityBadge severity={rule.severity} />
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{rule.category}</p>
                        </div>
                        <Toggle enabled={true} onChange={() => {}} />
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {tab === 'notifications' && (
              <div className="space-y-5">
                <h2 className="text-base font-600 text-gray-900">Notification Preferences</h2>
                <div className="space-y-2">
                  {[
                    { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
                    { key: 'slack', label: 'Slack Integration', desc: 'Send alerts to Slack channel' },
                    { key: 'sla', label: 'SLA Breach Alerts', desc: 'Alert when review SLA is at risk' },
                    { key: 'newProduct', label: 'New Product Submitted', desc: 'When a new product is added' },
                    { key: 'approved', label: 'Product Approved', desc: 'When a product is approved' },
                    { key: 'rejected', label: 'Product Rejected', desc: 'When a product is rejected' },
                    { key: 'certificate', label: 'Certificate Expiry', desc: 'Alert 30 days before expiry' }
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-500 text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <Toggle
                        enabled={notifications[item.key]}
                        onChange={v => setNotifications(n => ({ ...n, [item.key]: v }))}
                      />
                    </div>
                  ))}
                </div>
                <Button>Save Preferences</Button>
              </div>
            )}

            {tab === 'users' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-600 text-gray-900">Team Members</h2>
                  <Button size="sm" icon={FiPlus}>Invite User</Button>
                </div>
                <div className="space-y-2">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-600">{user.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-600 text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="hidden sm:block text-right flex-shrink-0">
                        <p className="text-xs font-600 text-gray-700">{user.role}</p>
                        <p className="text-xs text-gray-400">{user.productsReviewed} reviews · {user.approvalRate}</p>
                      </div>
                      <span className="w-2 h-2 bg-teal-400 rounded-full flex-shrink-0" />
                      <div className="flex gap-1 flex-shrink-0">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors">
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'integrations' && (
              <div className="space-y-5">
                <h2 className="text-base font-600 text-gray-900">Integrations</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: 'Amazon Seller Central', enabled: true, desc: 'Sync products from Amazon marketplace', color: 'bg-orange-100' },
                    { name: 'Shopify', enabled: true, desc: 'Import and publish to Shopify store', color: 'bg-teal-100' },
                    { name: 'Walmart Marketplace', enabled: false, desc: 'Connect to Walmart seller account', color: 'bg-teal-100' },
                    { name: 'eBay', enabled: false, desc: 'List products on eBay marketplace', color: 'bg-yellow-100' },
                    { name: 'Slack', enabled: false, desc: 'Send compliance alerts to Slack', color: 'bg-purple-100' },
                    { name: 'Zapier', enabled: false, desc: 'Automate workflows with 5000+ apps', color: 'bg-red-100' }
                  ].map(integration => (
                    <div key={integration.name} className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                      <div className={`w-10 h-10 rounded-xl ${integration.color} flex items-center justify-center flex-shrink-0`}>
                        <FiLink className="w-4 h-4 text-gray-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-600 text-gray-900">{integration.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{integration.desc}</p>
                      </div>
                      <Toggle enabled={integration.enabled} onChange={() => {}} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
