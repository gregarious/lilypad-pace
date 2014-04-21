'''
Script to remove any duplicate PeriodicRecords. The lowest found point value for each category
is kept as the canonical PdRecord.
'''
from pace.models import PeriodicRecord

pd_buckets = {}
for pd in PeriodicRecord.objects.all():
    classroom = pd.student.classroom if pd.student else '----'
    key = '%s-%s-%s-%s' % (classroom, str(pd.student.id), pd.date.strftime('%Y%m%d'), str(pd.period))
    bucket = pd_buckets.setdefault(key, [])
    bucket.append(pd)

for k, pds in pd_buckets.items():
  if len(pds) > 1:
    # find the minimum point value in each category
    min_bs = 2
    min_cw = 2
    min_fd = 2
    min_kw = 2
    for pd in pds:
      min_bs = min([pd.be_safe_points for pd in pds])
      min_cw = min([pd.complete_work_points for pd in pds])
      min_fd = min([pd.follow_directions_points for pd in pds])
      min_kw = min([pd.kind_words_points for pd in pds])
    print '\n' + str(k)

    # set the canonical period
    pd = pds[0]
    pd.be_safe_points = min_bs
    pd.complete_work_points = min_cw
    pd.follow_directions_points = min_fd
    pd.kind_words_points = min_kw
    pd.save()
    print '  keeping  %d %d %d %d' % (pd.be_safe_points, pd.complete_work_points, pd.follow_directions_points, pd.kind_words_points)

    # erase all other periods
    for bad_pd in pds[1:]:
      print '  deleting %d %d %d %d' % (bad_pd.be_safe_points, bad_pd.complete_work_points, bad_pd.follow_directions_points, bad_pd.kind_words_points)
      bad_pd.delete()
