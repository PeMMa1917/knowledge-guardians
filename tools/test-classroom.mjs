import assert from 'node:assert/strict';
import {test} from 'node:test';
import worker from '../server/classroom.mjs';
import {fixture} from './classroom-preview.mjs';

test('fictional classroom recovery, revision history, current membership and teacher scope',async()=>{
  const {DB,sql,password}=await fixture();
  try {
    const origin='https://school.example';
    const call=(path,{cookie='',method='GET',value}={})=>worker.fetch(new Request(origin+'/api/classroom/'+path,{
      method,headers:{Origin:origin,Cookie:cookie,'Content-Type':'application/json'},body:value===undefined?undefined:JSON.stringify(value)}),{DB});
    async function sign(role,login) {
      const response=await call(role+'/login',{method:'POST',value:{login,password}});
      assert.equal(response.status,200);
      assert.match(response.headers.get('set-cookie'),/HttpOnly; Secure; SameSite=Strict/);
      return response.headers.get('set-cookie').split(';')[0];
    }
    const a=await sign('student','ash-moth'), b=await sign('student','moss-wren'), ta=await sign('teacher','north@example.invalid'), tb=await sign('teacher','south@example.invalid');
    const save='student/save?account=a&class=north&teacher=ta';
    const dashboard='teacher/writing?account=ta&class=north';
    const writing=[{kind:'note',title:'',text:'The bell rang twice.'},{kind:'draft-question',title:'',text:'Who heard the first bell?'}];
    const put=(revision,content='sealed student copy')=>call(save,{cookie:a,method:'PUT',value:{revision,package:content,writing}});
    assert.equal((await put(0)).status,200);
    assert.equal((await put(0)).status,200); // Lost acknowledgement and retry.
    assert.equal((await put(0,'another version')).status,409);
    const deviceB=await sign('student','ash-moth');
    assert.equal((await (await call(save,{cookie:deviceB})).json()).package,'sealed student copy');
    const seen=await (await call(dashboard,{cookie:ta})).json();
    assert.deepEqual(seen[0].entries,writing);assert.ok(!('package' in seen[0]));
    assert.equal((await call(dashboard,{cookie:tb})).status,403);
    assert.equal((await call('teacher/writing?account=tb&class=north',{cookie:tb})).status,403);
    assert.deepEqual((await (await call('teacher/writing?account=tb&class=south',{cookie:tb})).json())[0].entries,[]);
    assert.equal((await call(save,{cookie:b})).status,403);
    assert.equal((await call(dashboard,{cookie:a})).status,401);
    assert.equal((await call(save,{cookie:ta})).status,401);
    assert.equal((await call(dashboard)).status,401);
    assert.equal((await call('student/login',{method:'POST',value:{login:'pending-rook',password}})).status,403);
    for(let i=1;i<8;i++) assert.equal((await put(i,'revision-'+i)).status,200);
    assert.equal(sql.prepare('SELECT count(*) AS n FROM versions').get().n,5);
    sql.exec("UPDATE memberships SET approved=0 WHERE student='a'");
    assert.equal((await call(save,{cookie:a})).status,403);
    assert.equal((await put(8)).status,403);
    assert.deepEqual(await (await call(dashboard,{cookie:ta})).json(),[]);
    assert.equal((await call('teacher/logout',{cookie:ta,method:'POST'})).status,200);
    assert.equal((await call(dashboard,{cookie:ta})).status,401);
  } finally {sql.close();}
});
