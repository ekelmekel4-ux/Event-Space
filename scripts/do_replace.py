import re

def main():
    with open('src/App.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Remove the old persistent footer
    content = re.sub(r'\{\/\* PERSISTENT APP FOOTER \*\/\}[\s\S]*?\)\}', '', content)
    
    # 2. Add AppFooter component definition if not exists
    if 'const AppFooter =' not in content:
        footer_comp = """
const AppFooter = () => (
  <div className="bg-transparent mt-8 pt-6 pb-8 px-6 text-center shrink-0 border-t border-slate-200/50">
    <p className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase mb-0.5">EventSpace V3.0</p>
    <p className="text-[9px] font-medium text-slate-400">© 2026 Platform Manajemen Event & Retail. All rights reserved.</p>
  </div>
);
"""
        content = content.replace("export default function App() {\n", "export default function App() {\n" + footer_comp)

    # 3. Insert <AppFooter /> in each screen.
    # I'll manually define the end strings of each screen's overflow container.
    replacements = [
        (
            '''                  )}
                </div>
              </div>
            )}''',
            '''                  )}
                </div>
                <AppFooter />
              </div>
            )}'''
        ),
        (
            '''                    </p>
                  </div>
                </div>
                <div className="bg-white border-t border-slate-150 p-5 shrink-0 flex items-center justify-between gap-4">''',
            '''                    </p>
                  </div>
                </div>
                <AppFooter />
                </div>
                <div className="bg-white border-t border-slate-150 p-5 shrink-0 flex items-center justify-between gap-4">'''
        ),
        (
            '''                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-white border-t border-slate-150 p-5 shrink-0 flex gap-2.5">''',
            '''                      </button>
                    </div>
                  </div>
                <AppFooter />
                </div>
                <div className="bg-white border-t border-slate-150 p-5 shrink-0 flex gap-2.5">'''
        ),
        (
            '''                    </div>
                  </div>
                </div>
                <div className="bg-white border-t border-slate-150 p-5 shrink-0">''',
            '''                    </div>
                  </div>
                <AppFooter />
                </div>
                <div className="bg-white border-t border-slate-150 p-5 shrink-0">'''
        ),
        (
            '''                    </div>
                  )}
                </div>
              </div>
            )}''',
            '''                    </div>
                  )}
                <AppFooter />
                </div>
              </div>
            )}'''
        ),
        (
            '''                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}''',
            '''                      </div>
                    </div>
                  </div>
                <AppFooter />
                </div>
              </div>
            )}'''
        ),
        (
            '''                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}''',
            '''                          </div>
                        );
                      })}
                    </div>
                  </div>
                <AppFooter />
                </div>
              </div>
            )}'''
        ),
        (
            '''                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}''',
            '''                          </div>
                        );
                      })}
                    </div>
                  )}
                <AppFooter />
                </div>
              </div>
            )}'''
        ),
        (
            '''                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}''',
            '''                        );
                      })}
                    </div>
                  )}
                <AppFooter />
                </div>
              </div>
            )}'''
        ),
        (
            '''                    </select>
                  </div>
                </div>

                {/* Action buttons bottom */}
                <div className="bg-white border-t border-slate-150 p-5 shrink-0 flex gap-2.5">''',
            '''                    </select>
                  </div>
                <AppFooter />
                </div>

                {/* Action buttons bottom */}
                <div className="bg-white border-t border-slate-150 p-5 shrink-0 flex gap-2.5">'''
        )
    ]
    
    for old, new in replacements:
        if old in content:
            # We must only replace once per screen, or maybe some are identical?
            # E.g. "home" and another might have the exact same end string!
            # If so, replacing it globally is fine.
            content = content.replace(old, new)
        else:
            print("Could not find:", repr(old))
            
    with open('src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    main()
